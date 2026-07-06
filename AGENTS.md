# AI agent instructions (canton-devkit-demo-project)

Repo-specific guidance for coding agents working in this repository.

## GitHub Actions

- **Always use self-hosted runners** for workflows in `.github/workflows/`. LocalNet integration jobs use `runs-on: [self-hosted, Linux, X64, proxmox, e2e]` (same Proxmox e2e runner as [canton-devkit](https://github.com/bitdynamics-ab/canton-devkit)). Do **not** use GitHub-hosted runners (`ubuntu-latest`, etc.) unless explicitly requested.
- Self-hosted jobs must clean up after themselves (containers, volumes, temp files). Use `if: always()` teardown steps for Docker/LocalNet workloads.
- Prefer installing tools to user-writable paths (`$HOME/.local/bin`, `$RUNNER_TEMP`) rather than `sudo` on self-hosted machines.
- Pin DPM/canton-devkit versions in workflow env vars; skip download when the tool is already on `PATH`.



## LocalNet / canton-devkit

- Examples live under `example-1/`, `example-2/`, etc. Run `dpm`, `make`, and npm commands from the example directory unless noted otherwise.
- DAR uploads to LocalNet should use `--all-participants` so both app-user and app-provider participants can interpret templates.
- JSON Ledger API clients must use host header `json-ledger-api.localhost`, not bare `localhost`.



## Commits

- Use [Conventional Commits](https://www.conventionalcommits.org/).

