import assert from "node:assert/strict";
import test from "node:test";
import {
  createLedgerClient,
  parseContracts,
  partyFromPayload,
} from "../lib/ledger.ts";

const required = [
  "CANTON_APP_PROVIDER_PARTY",
  "CANTON_APP_USER_PARTY",
  "CANTON_PARTICIPANT_JSON_APP_PROVIDER_PORT",
  "CANTON_PARTICIPANT_JSON_APP_USER_PORT",
  "CANTON_APP_PROVIDER_JWT",
  "CANTON_APP_USER_JWT",
];

for (const name of required) {
  if (!process.env[name]) {
    throw new Error(
      `Missing ${name}. Run: eval "$(canton-devkit localnet env --name ci --include-jwt)"`,
    );
  }
}

const providerParty = process.env.CANTON_APP_PROVIDER_PARTY!;
const userParty = process.env.CANTON_APP_USER_PARTY!;
const providerLedger = createLedgerClient({
  host: "json-ledger-api.localhost",
  port: process.env.CANTON_PARTICIPANT_JSON_APP_PROVIDER_PORT!,
  jwt: process.env.CANTON_APP_PROVIDER_JWT!,
});
const userLedger = createLedgerClient({
  host: "json-ledger-api.localhost",
  port: process.env.CANTON_PARTICIPANT_JSON_APP_USER_PORT!,
  jwt: process.env.CANTON_APP_USER_JWT!,
});

const IOU = "Iou:Iou";
const PROPOSAL = "Iou:TransferProposal";

test("provider mints, proposes transfer, user accepts", async () => {
  await providerLedger.submitAndWait(
    [
      {
        CreateCommand: {
          templateId: `#canton-devkit-demo:${IOU}`,
          createArguments: {
            issuer: providerParty,
            owner: providerParty,
            amount: "42.0",
            currency: "USD",
          },
        },
      },
    ],
    [providerParty],
  );

  const providerIousRaw = await providerLedger.getActiveContracts(providerParty);
  const providerIous = parseContracts(providerIousRaw, IOU).filter(
    (contract) => partyFromPayload(contract.payload.owner) === providerParty,
  );
  assert.equal(providerIous.length, 1);

  const iouCid = providerIous[0].contractId;

  await providerLedger.submitAndWait(
    [
      {
        ExerciseCommand: {
          templateId: `#canton-devkit-demo:${IOU}`,
          contractId: iouCid,
          choice: "ProposeTransfer",
          choiceArgument: { newOwner: userParty },
        },
      },
    ],
    [providerParty],
  );

  const proposalsRaw = await userLedger.getActiveContracts(userParty);
  const proposals = parseContracts(proposalsRaw, PROPOSAL).filter(
    (contract) => partyFromPayload(contract.payload.newOwner) === userParty,
  );
  assert.equal(proposals.length, 1);

  await userLedger.submitAndWait(
    [
      {
        ExerciseCommand: {
          templateId: `#canton-devkit-demo:${PROPOSAL}`,
          contractId: proposals[0].contractId,
          choice: "Accept",
          choiceArgument: {},
        },
      },
    ],
    [userParty],
  );

  const userIousRaw = await userLedger.getActiveContracts(userParty);
  const userIous = parseContracts(userIousRaw, IOU).filter(
    (contract) => partyFromPayload(contract.payload.owner) === userParty,
  );
  assert.equal(userIous.length, 1);
  assert.equal(userIous[0].payload.amount, "42.0");
});
