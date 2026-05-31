#!/usr/bin/env sh
set -e
# Script lives in backend/scripts — app root is one level up.
APP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_ROOT"

echo "Railway build in: $(pwd)"
test -f package-lock.json || { echo "package-lock.json not found" >&2; exit 1; }
test -f prisma/schema.prisma || { echo "prisma/schema.prisma not found" >&2; exit 1; }

npm ci --include=dev
npm exec prisma generate
npm run build
