# AI agent instructions (canton-devkit-demo-project)

Repo-specific guidance for coding agents working in this repository.

## GitHub Actions

- **Always use self-hosted runners** for workflows in `.github/workflows/`. Set `runs-on: self-hosted` (or a repo-specific self-hosted label if the org uses one). Do **not** use GitHub-hosted runners (`ubuntu-latest`, `macos-latest`, etc.) unless explicitly requested.
- Self-hosted jobs must clean up after themselves (containers, volumes, temp files). Use `if: always()` teardown steps for Docker/LocalNet workloads.
- Prefer installing tools to user-writable paths (`$HOME/.local/bin`) rather than `sudo` on self-hosted machines.
- Detect OS/arch when downloading release binaries; do not hardcode `linux_amd64` unless the workflow is scoped to Linux-only runners.



## LocalNet / canton-devkit

- Pin **canton-devkit `v0.12.2`** in CI (`DEVKIT_VERSION`), `Makefile`, and scripts unless bumping intentionally.
- Examples live under `example-1/`, `example-2/`, etc. Run `dpm`, `make`, and npm commands from the example directory unless noted otherwise.
- DAR uploads to LocalNet should use `--all-participants` so both app-user and app-provider participants can interpret templates.
- JSON Ledger API clients must use host header `json-ledger-api.localhost`, not bare `localhost`.



## Commits

- Use [Conventional Commits](https://www.conventionalcommits.org/).

