#!/usr/bin/env bash
# Build the Linux AppImage and the Windows artifacts.
set -euo pipefail
cd "$(dirname "$(readlink -f "$0")")"
npm install --no-audit --no-fund
npm run build:linux
if command -v wine >/dev/null 2>&1; then
  npm run build:windows
else
  echo "wine not found - skipping the Windows build" >&2
fi
