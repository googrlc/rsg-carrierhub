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
# To route the AI advisors through the LiteLLM proxy, put these in .env.deploy:
#   CARRIERHUB_LLM_BASE_URL=https://<litellm-vps>/v1
#   CARRIERHUB_LLM_API_KEY=<litellm virtual key>
#   CARRIERHUB_LLM_MODEL=gpt-4.1-mini
# Omit CARRIERHUB_LLM_BASE_URL to call OpenAI directly.
#
# To open the MCP door at POST /mcp, also set:
#   CARRIERHUB_MCP_TOKEN=<openssl rand -hex 32>
# Without it the door refuses every call — see the WARN below.
#
# The old HERMES_OPENAI_* names still work (the app reads them as a fallback) and
# are carried over automatically from a running container on the first deploy
# after the rename.
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
: "${SUPABASE_URL:=${VITE_SUPABASE_URL}}"

# Read a var out of the currently-running container, so a bare re-run keeps
# working without .env.deploy. Also the migration path off the HERMES_* names:
# pass the old name second and it is picked up from the live container once.
from_container() {
  local val
  for key in "$@"; do
    val=$(docker inspect "$NAME" --format '{{range .Config.Env}}{{println .}}{{end}}' 2>/dev/null \
          | sed -n "s/^${key}=//p" | head -1 || true)
    [ -n "$val" ] && { printf '%s' "$val"; return; }
  done
}

[ -n "${CARRIERHUB_LLM_API_KEY:-}" ] || CARRIERHUB_LLM_API_KEY=$(from_container CARRIERHUB_LLM_API_KEY HERMES_OPENAI_API_KEY)
[ -n "${CARRIERHUB_LLM_BASE_URL:-}" ] || CARRIERHUB_LLM_BASE_URL=$(from_container CARRIERHUB_LLM_BASE_URL HERMES_OPENAI_BASE_URL)
[ -n "${CARRIERHUB_LLM_MODEL:-}" ] || CARRIERHUB_LLM_MODEL=$(from_container CARRIERHUB_LLM_MODEL HERMES_OPENAI_MODEL)
: "${CARRIERHUB_LLM_MODEL:=gpt-4.1-mini}"
[ -n "${CARRIERHUB_LLM_API_KEY:-}" ] || echo "WARN: no CARRIERHUB_LLM_API_KEY — the advisors will report themselves unavailable"

# The MCP door fails closed. No token means /mcp refuses every call; the HTTP API
# and the UI are unaffected.
[ -n "${CARRIERHUB_MCP_TOKEN:-}" ] || CARRIERHUB_MCP_TOKEN=$(from_container CARRIERHUB_MCP_TOKEN)
[ -n "${CARRIERHUB_MCP_TOKEN:-}" ] || echo "WARN: no CARRIERHUB_MCP_TOKEN — /mcp will refuse every call (set one: openssl rand -hex 32)"

# The service-role key powers the carrier endpoints (server-side DB access, no
# browser login). It NEVER goes to the browser.
[ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ] || SUPABASE_SERVICE_ROLE_KEY=$(from_container SUPABASE_SERVICE_ROLE_KEY)
[ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ] || echo "WARN: no SUPABASE_SERVICE_ROLE_KEY — /api/carriers will 503 (carrier directory won't load)"

if [ -n "${CARRIERHUB_LLM_BASE_URL:-}" ]; then echo "==> advisor route: LiteLLM ($CARRIERHUB_LLM_BASE_URL)"; else echo "==> advisor route: OpenAI direct"; fi

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
  -e CARRIERHUB_LLM_API_KEY="${CARRIERHUB_LLM_API_KEY:-}" \
  ${CARRIERHUB_LLM_BASE_URL:+-e CARRIERHUB_LLM_BASE_URL="$CARRIERHUB_LLM_BASE_URL"} \
  -e CARRIERHUB_LLM_MODEL="$CARRIERHUB_LLM_MODEL" \
  ${CARRIERHUB_MODEL_DESK:+-e CARRIERHUB_MODEL_DESK="$CARRIERHUB_MODEL_DESK"} \
  ${CARRIERHUB_MODEL_ADVISOR:+-e CARRIERHUB_MODEL_ADVISOR="$CARRIERHUB_MODEL_ADVISOR"} \
  ${CARRIERHUB_MODEL_QUICK:+-e CARRIERHUB_MODEL_QUICK="$CARRIERHUB_MODEL_QUICK"} \
  ${CARRIERHUB_MCP_TOKEN:+-e CARRIERHUB_MCP_TOKEN="$CARRIERHUB_MCP_TOKEN"} \
  -e SUPABASE_URL="$SUPABASE_URL" \
  ${SUPABASE_SERVICE_ROLE_KEY:+-e SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"} \
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
