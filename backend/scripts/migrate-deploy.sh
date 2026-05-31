#!/usr/bin/env sh
set -e
cd "$(dirname "$0")/.."
echo "Running Prisma migrate deploy (reads backend/.env automatically)..."
npx prisma migrate deploy
