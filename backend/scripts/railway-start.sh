#!/usr/bin/env sh
set -e
APP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_ROOT"
exec node dist/src/main.js
