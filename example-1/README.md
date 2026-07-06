# Example 1: IOU Daml Demo

A minimal Canton Network demo with **two separate apps** — one for the app-provider participant and one for the app-user participant — built on [canton-devkit](https://github.com/bitdynamics-ab/canton-devkit) LocalNet.

- **App-provider** (`:5173` / backend `:3001`): mint IOUs, propose transfers to the app-user party
- **App-user** (`:5174` / backend `:3002`): list pending proposals, accept or reject, view received IOUs

Each frontend talks only to its own backend. JWTs and JSON Ledger API calls stay server-side.

## Prerequisites

- Docker Desktop / Engine with Compose v2
- ~8 GB RAM allocated to Docker
- [DPM](https://docs.canton.network/sdks-tools/cli-tools/dpm) (`dpm install package`)
- [canton-devkit](https://github.com/bitdynamics-ab/canton-devkit) standalone binary **or** the DPM component
- Node.js 20+

```bash
canton-devkit localnet doctor   # or: dpm localnet doctor
```

## Quick start

```bash
cd example-1

# Start LocalNet (first run may take several minutes)
canton-devkit localnet up demo   # or: dpm localnet up demo

# Export connection info + JWTs
eval "$(canton-devkit localnet env demo --include-jwt)"

# Build Daml and upload to both participants
dpm build
canton-devkit localnet dar upload "$(ls .daml/dist/*.dar | head -1)" --instance demo --all-participants

# Start both apps (backends + frontends)
chmod +x scripts/dev.sh
./scripts/dev.sh
```

Open two browser tabs:

1. **Provider UI** — http://localhost:5173 — mint an IOU, click **Transfer to app-user**
2. **User UI** — http://localhost:5174 — accept the pending proposal

## Project layout

```
example-1/
├── daml/                  # Iou + TransferProposal templates
├── apps/
│   ├── app-provider/      # provider backend + frontend
│   └── app-user/          # user backend + frontend
├── lib/ledger.ts          # shared JSON Ledger API v2 client
├── scripts/dev.sh         # start LocalNet apps
├── scripts/test-localnet.sh
└── test/integration.test.ts
```

## Develop and test

```bash
cd example-1

# Fast Daml-only loop (no Docker)
dpm test

# Full LocalNet integration test (same beats as CI)
chmod +x scripts/test-localnet.sh
./scripts/test-localnet.sh

# Hot-deploy Daml changes
canton-devkit localnet dar watch --project . --instance demo --all-participants

# Inspect ledger
canton-devkit localnet contracts watch demo
canton-devkit localnet tx ls demo --party "$CANTON_APP_PROVIDER_PARTY"

# Teardown
canton-devkit localnet down demo
```

## Topology

```text
Provider UI → Provider backend → app-provider JSON API
User UI     → User backend     → app-user JSON API
                     ↕ synchronizer (cross-participant transfer)
```

The provider mints and proposes on the **app-provider** participant. The user accepts on the **app-user** participant. `TransferProposal` uses `observer newOwner` so proposals are visible across participants.

## CI

GitHub Actions workflow [`.github/workflows/example-1-localnet-tests.yml`](../.github/workflows/example-1-localnet-tests.yml) runs on the **self-hosted Proxmox e2e runner** (`[self-hosted, Linux, X64, proxmox, e2e]`), spins up a throwaway LocalNet, runs `dpm test` and the cross-participant integration test, then tears down.

## Troubleshooting

| Issue | Fix |
|---|---|
| `json-ledger-api.localhost` errors | Backends always set `Host: json-ledger-api.localhost`; do not use bare `localhost` |
| Template not found | Re-upload with `--all-participants`; check `#canton-devkit-demo:Iou:Iou` package name |
| Proposals not visible on user side | Confirm DAR on both participants; verify `CANTON_APP_USER_PARTY` in env |
| LocalNet slow to start | First cold start can take 1–5 minutes; `localnet up` blocks until healthy |

## Going further

- [canton-devkit getting started](https://github.com/bitdynamics-ab/canton-devkit/blob/main/docs/getting-started.md)
- [cn-quickstart topology](https://github.com/digital-asset/cn-quickstart/blob/main/sdk/docs/user/002-topology.md)
- [JSON Ledger API v2](https://docs.canton.network/sdks-tools/api-reference/json-api)
- [Plan 2: Wallet SDK demo](../docs/plans/plan-2-wallet-sdk-demo.md)
