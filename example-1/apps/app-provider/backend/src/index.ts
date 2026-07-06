import cors from "cors";
import express from "express";
import {
  createLedgerClient,
  parseContracts,
  partyFromPayload,
} from "../../../../lib/ledger.js";
import { loadProviderConfig } from "./config.js";

const IOU_TEMPLATE = "Iou:Iou";
const config = loadProviderConfig();
const ledger = createLedgerClient(config.ledger);
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", role: "app-provider" });
});

app.get("/api/iou", async (_req, res) => {
  try {
    const raw = await ledger.getActiveContracts(config.providerParty);
    const contracts = parseContracts(raw, IOU_TEMPLATE).filter(
      (contract) => partyFromPayload(contract.payload.owner) === config.providerParty,
    );
    res.json({ ious: contracts });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post("/api/iou", async (req, res) => {
  try {
    const amount = Number(req.body?.amount ?? 100);
    const currency = String(req.body?.currency ?? "USD");

    await ledger.submitAndWait(
      [
        {
          CreateCommand: {
            templateId: `#canton-devkit-demo:${IOU_TEMPLATE}`,
            createArguments: {
              issuer: config.providerParty,
              owner: config.providerParty,
              amount: amount.toString(),
              currency,
            },
          },
        },
      ],
      [config.providerParty],
    );

    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post("/api/iou/:cid/transfer", async (req, res) => {
  try {
    await ledger.submitAndWait(
      [
        {
          ExerciseCommand: {
            templateId: `#canton-devkit-demo:${IOU_TEMPLATE}`,
            contractId: req.params.cid,
            choice: "ProposeTransfer",
            choiceArgument: {
              newOwner: config.userParty,
            },
          },
        },
      ],
      [config.providerParty],
    );

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.listen(config.port, () => {
  console.log(`app-provider backend listening on http://localhost:${config.port}`);
});
