#!/usr/bin/env sh
set -e

export NODE_ENV="${NODE_ENV:-production}"
export PORT="${PORT:-4000}"

echo "GRATEHCARE boot: NODE_ENV=${NODE_ENV} PORT=${PORT}"
echo "GRATEHCARE boot: DATABASE_URL=$([ -n "$DATABASE_URL" ] && echo set || echo MISSING)"
echo "GRATEHCARE boot: JWT_SECRET=$([ -n "$JWT_SECRET" ] && echo set || echo MISSING)"

if [ -z "$DATABASE_URL" ] || [ -z "$JWT_SECRET" ]; then
  echo "GRATEHCARE boot: ERROR — DATABASE_URL and JWT_SECRET are required." >&2
  exit 1
fi

if [ -z "$DIRECT_URL" ]; then
  export DIRECT_URL="$DATABASE_URL"
fi

npx prisma migrate deploy
exec node dist/src/main.js
