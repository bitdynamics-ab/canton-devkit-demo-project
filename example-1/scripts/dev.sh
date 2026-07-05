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

INSTANCE="${INSTANCE:-demo}"

if ! localnet status --name "$INSTANCE" >/dev/null 2>&1; then
  echo "Starting LocalNet instance '$INSTANCE'..."
  localnet up --name "$INSTANCE"
fi

eval "$(localnet env --name "$INSTANCE" --include-jwt)"

echo "Building and uploading DAR..."
dpm build
localnet dar upload "$(ls .daml/dist/*.dar | head -1)" --instance "$INSTANCE" --all-participants

install_deps() {
  local dir="$1"
  if [ ! -d "$dir/node_modules" ]; then
    echo "Installing npm deps in $dir"
    (cd "$dir" && npm install)
  fi
}

install_deps apps/app-provider/backend
install_deps apps/app-provider/frontend
install_deps apps/app-user/backend
install_deps apps/app-user/frontend

cleanup() {
  for pid in $(jobs -p); do
    kill "$pid" 2>/dev/null || true
  done
}

trap cleanup EXIT INT TERM

echo "Starting app-provider backend on :3001"
(
  cd apps/app-provider/backend
  PORT=3001 npm run dev
) &

echo "Starting app-user backend on :3002"
(
  cd apps/app-user/backend
  PORT=3002 npm run dev
) &

echo "Starting app-provider frontend on :5173"
(
  cd apps/app-provider/frontend
  npm run dev
) &

echo "Starting app-user frontend on :5174"
(
  cd apps/app-user/frontend
  npm run dev
) &

echo
echo "Provider UI: http://localhost:5173"
echo "User UI:     http://localhost:5174"
echo "Press Ctrl+C to stop app processes (LocalNet keeps running)."

wait
