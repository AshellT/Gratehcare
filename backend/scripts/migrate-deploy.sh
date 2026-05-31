#!/usr/bin/env sh
set -e
cd "$(dirname "$0")/.."

echo "Running Prisma migrate deploy..."
echo "  DATABASE_URL host: $(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')"
echo "  DIRECT_URL host:   $(echo "$DIRECT_URL" | sed -E 's|.*@([^:/]+).*|\1|')"

if [ -z "$DATABASE_URL" ] || [ -z "$DIRECT_URL" ]; then
  echo "ERROR: DATABASE_URL and DIRECT_URL must be set." >&2
  echo "See backend/.env.example" >&2
  exit 1
fi

npx prisma migrate deploy
