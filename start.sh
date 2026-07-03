#!/usr/bin/env sh
set -eu

if [ ! -f .env ]; then
  cp .env.example .env
fi

docker compose up -d --build
docker compose ps

WEB_PORT_VALUE="$(grep -E '^WEB_PORT=' .env | tail -n 1 | cut -d= -f2- || true)"
WEB_PORT_VALUE="${WEB_PORT_VALUE:-8080}"

echo "Diamond Frenzy Web is available at http://127.0.0.1:${WEB_PORT_VALUE}"
