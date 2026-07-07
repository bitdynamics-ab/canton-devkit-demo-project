# AI agent instructions (canton-devkit-demo-project)

Repo-specific guidance for coding agents working in this repository.

## GitHub Actions

- **Always use self-hosted runners** for workflows in `.github/workflows/`. LocalNet jobs use `runs-on: [self-hosted, Linux, X64, proxmox, e2e]`. Do **not** use GitHub-hosted runners unless explicitly requested.
- Self-hosted jobs must clean up after themselves (containers, volumes, temp files). Use `if: always()` teardown steps for Docker/LocalNet workloads.
- Prefer installing tools to user-writable paths (`$HOME/.local/bin`, `$RUNNER_TEMP`) rather than `sudo` on self-hosted machines.
- After appending to `$GITHUB_PATH`, invoke binaries by absolute path in the **same** step (`$GITHUB_PATH` applies only to later steps).



## LocalNet / canton-devkit

- Pin **canton-devkit `v0.12.2`** in CI (`DEVKIT_VERSION`), `Makefile`, and scripts unless bumping intentionally.
- Examples live under `example-1/`, `example-2/`, etc. Run `dpm`, `make`, and npm commands from the example directory unless noted otherwise.
- DAR uploads to LocalNet should use `--all-participants` so both app-user and app-provider participants can interpret templates.
- JSON Ledger API clients must use host header `json-ledger-api.localhost`, not bare `localhost`.



## Pull requests

- If tests fail in a PR because of the new changes, always try to fix them and make them pass.


## Commits

- Use [Conventional Commits](https://www.conventionalcommits.org/).

