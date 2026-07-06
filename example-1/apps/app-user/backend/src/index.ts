import cors from "cors";
import express from "express";
import {
  createLedgerClient,
  parseContracts,
  partyFromPayload,
} from "../../../../lib/ledger.js";
import { loadUserConfig } from "./config.js";

const IOU_TEMPLATE = "Iou:Iou";
const PROPOSAL_TEMPLATE = "Iou:TransferProposal";
const config = loadUserConfig();
const ledger = createLedgerClient(config.ledger);
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", role: "app-user" });
});

app.get("/api/proposals", async (_req, res) => {
  try {
    const raw = await ledger.getActiveContracts(config.userParty);
    const proposals = parseContracts(raw, PROPOSAL_TEMPLATE).filter(
      (contract) =>
        partyFromPayload(contract.payload.newOwner) === config.userParty,
    );
    res.json({ proposals });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get("/api/iou", async (_req, res) => {
  try {
    const raw = await ledger.getActiveContracts(config.userParty);
    const ious = parseContracts(raw, IOU_TEMPLATE).filter(
      (contract) => partyFromPayload(contract.payload.owner) === config.userParty,
    );
    res.json({ ious });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post("/api/proposal/:cid/accept", async (req, res) => {
  try {
    await ledger.submitAndWait(
      [
        {
          ExerciseCommand: {
            templateId: `#canton-devkit-demo:${PROPOSAL_TEMPLATE}`,
            contractId: req.params.cid,
            choice: "Accept",
            choiceArgument: {},
          },
        },
      ],
      [config.userParty],
    );

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post("/api/proposal/:cid/reject", async (req, res) => {
  try {
    await ledger.submitAndWait(
      [
        {
          ExerciseCommand: {
            templateId: `#canton-devkit-demo:${PROPOSAL_TEMPLATE}`,
            contractId: req.params.cid,
            choice: "Reject",
            choiceArgument: {},
          },
        },
      ],
      [config.userParty],
    );

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.listen(config.port, () => {
  console.log(`app-user backend listening on http://localhost:${config.port}`);
});
