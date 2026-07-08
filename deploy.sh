#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Carrier Hub — one-command redeploy on the Elestio / hermes-gretch box.
#
#   cd /opt/rsg-carrierhub && ./deploy.sh
#
# Pulls main, rebuilds the image (old container keeps serving during the build),
# swaps the container, health-checks, and keeps a rollback image. Idempotent.
#
# Config precedence for runtime + build values:
#   1. .env.deploy  (this dir, gitignored, chmod 600) — the source of truth
#   2. the currently-running container's env (fallback, so a bare run still works)
#   3. built-in defaults below
#
# To route the AI advisor through the LiteLLM proxy, put these in .env.deploy:
#   HERMES_OPENAI_BASE_URL=https://<litellm-vps>/v1
#   HERMES_OPENAI_API_KEY=<litellm virtual key>
#   HERMES_OPENAI_MODEL=gpt-4.1-mini
# Omit HERMES_OPENAI_BASE_URL to call OpenAI directly.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"

NAME=rsg-carrierhub
IMAGE=rsg-carrierhub:latest
PORT_MAP=3200:3000

echo "==> git pull"
git pull --ff-only

# ---- load config -----------------------------------------------------------
if [ -f .env.deploy ]; then echo "==> sourcing .env.deploy"; set -a; . ./.env.deploy; set +a; fi

: "${VITE_SUPABASE_URL:=https://wibscqhkvpijzqbhjphg.supabase.co}"
: "${VITE_SUPABASE_PUBLISHABLE_KEY:=sb_publishable_ULhQgB2QZzQM3HfQqgaZQA_jTZJxer8}"
: "${HERMES_OPENAI_MODEL:=gpt-4.1-mini}"

# Fall back to the running container's key if .env.deploy didn't set one.
if [ -z "${HERMES_OPENAI_API_KEY:-}" ]; then
  HERMES_OPENAI_API_KEY=$(docker inspect "$NAME" --format '{{range .Config.Env}}{{println .}}{{end}}' 2>/dev/null | sed -n 's/^HERMES_OPENAI_API_KEY=//p' || true)
fi
[ -n "${HERMES_OPENAI_API_KEY:-}" ] || echo "WARN: no HERMES_OPENAI_API_KEY — advisor will show 'AI Advisor Unavailable'"
if [ -n "${HERMES_OPENAI_BASE_URL:-}" ]; then echo "==> advisor route: LiteLLM ($HERMES_OPENAI_BASE_URL)"; else echo "==> advisor route: OpenAI direct"; fi

# ---- build (old container still serving) -----------------------------------
echo "==> docker build"
docker tag "$IMAGE" rsg-carrierhub:rollback 2>/dev/null || true
docker build \
  --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY="$VITE_SUPABASE_PUBLISHABLE_KEY" \
  -t "$IMAGE" .

# ---- swap ------------------------------------------------------------------
echo "==> swapping container"
docker rm -f "$NAME" 2>/dev/null || true
docker run -d --name "$NAME" --restart unless-stopped -p "$PORT_MAP" \
  -e HERMES_OPENAI_API_KEY="${HERMES_OPENAI_API_KEY:-}" \
  ${HERMES_OPENAI_BASE_URL:+-e HERMES_OPENAI_BASE_URL="$HERMES_OPENAI_BASE_URL"} \
  -e HERMES_OPENAI_MODEL="$HERMES_OPENAI_MODEL" \
  -e NODE_ENV=production -e PORT=3000 \
  "$IMAGE" >/dev/null

# ---- verify ----------------------------------------------------------------
echo -n "==> health: "
for i in $(seq 1 15); do
  if curl -sf -m 4 http://localhost:3200/api/health >/dev/null 2>&1; then curl -s http://localhost:3200/api/health; echo; echo "==> OK (rollback image: rsg-carrierhub:rollback)"; exit 0; fi
  sleep 1
done
echo "FAILED — check 'docker logs $NAME'. Roll back: docker rm -f $NAME && docker run -d --name $NAME --restart unless-stopped -p $PORT_MAP <same -e flags> rsg-carrierhub:rollback"
exit 1
