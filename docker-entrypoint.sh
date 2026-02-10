#!/usr/bin/env sh

set -e

: "${PG_HOST:=postgres}"
: "${PG_PORT:=5432}"
: "${PG_USERNAME:=postgres}"

echo ">>> Waiting for Postgres at ${PG_HOST}:${PG_PORT}..."
attempts=0
until nc -z "$PG_HOST" "$PG_PORT" >/dev/null 2>&1; do
  attempts=$((attempts+1))
  if [ "$attempts" -gt 60 ]; then
    echo "Postgres did not become available in time" >&2
    exit 1
  fi
  sleep 1
done
echo ">>> Postgres is reachable."

if [ "${NODE_ENV}" = "production" ]; then
  echo ">>> Running migrations..."
  # run compiled migration runner
  if [ -f ./dist/scripts/run-migrations.js ]; then
    node ./dist/scripts/run-migrations.js || {
      echo "Migration script failed" >&2
      exit 1
    }
  else
    echo "No migration script found at ./dist/scripts/run-migrations.js — skipping migrations"
  fi
fi

echo ">>> Starting application (start:prod)..."
exec npm run start:prod