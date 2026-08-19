#!/bin/sh
# Koyeb entrypoint: render nginx template with $PORT, start nginx in the
# background, then run uvicorn in the foreground.
set -e

export PORT="${PORT:-8080}"
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

nginx -g 'daemon off;' &
exec uvicorn backend.main:app --host 0.0.0.0 --port 8765
