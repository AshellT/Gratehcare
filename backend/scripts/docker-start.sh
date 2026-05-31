#!/usr/bin/env sh
set -e

echo "GRATEHCARE boot: NODE_ENV=${NODE_ENV:-unset} PORT=${PORT:-4000}"
echo "GRATEHCARE boot: DATABASE_URL=$([ -n "$DATABASE_URL" ] && echo set || echo MISSING)"
echo "GRATEHCARE boot: DIRECT_URL=$([ -n "$DIRECT_URL" ] && echo set || echo MISSING)"
echo "GRATEHCARE boot: JWT_SECRET=$([ -n "$JWT_SECRET" ] && echo set || echo MISSING)"

exec node dist/src/main.js
