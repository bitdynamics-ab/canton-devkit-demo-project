#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

localnet() {
  if command -v canton-devkit >/dev/null 2>&1; then
    canton-devkit localnet "$@"
  else
    dpm localnet "$@"
  fi
}

INSTANCE="${INSTANCE:-ci}"
DEVKIT_VERSION="${DEVKIT_VERSION:-v0.12.2}"
SPLICE_VERSION="${SPLICE_VERSION:-0.6.4}"

cleanup() {
  localnet clean --name "$INSTANCE" --force || true
}

trap cleanup EXIT

localnet doctor
localnet up --name "$INSTANCE" --version "$SPLICE_VERSION"

state_file="${HOME}/.canton-devkit/localnet/${INSTANCE}/state.json"
for role in app-user app-provider; do
  endpoint="localhost:$(jq -r --arg role "${role}" '.ports["participant_ledger_\($role)"]' "${state_file}")"
  localnet token party ls \
    --instance "$INSTANCE" \
    --role "${role}" \
    --endpoint "${endpoint}" \
    >/dev/null
done

eval "$(localnet env --name "$INSTANCE" --include-jwt)"

dpm build
localnet dar upload "$(ls .daml/dist/*.dar | head -1)" --instance "$INSTANCE" --all-participants

dpm test
npm install
npm test

echo "All tests passed."
