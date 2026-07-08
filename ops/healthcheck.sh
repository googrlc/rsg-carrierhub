#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Carrier Hub uptime monitor. Run from cron every 5 min on the hermes-gretch box.
# Posts to Slack #systems-check ONLY on a state change (up->down, down->up), so
# the channel stays quiet unless something actually breaks. A transient single
# blip is absorbed by the retry loop below.
#
# Secrets come from /opt/rsg-carrierhub/.env.ops (root:600, gitignored):
#     SLACK_BOT_TOKEN=xoxb-...            # HermesGretch_Slack_bot_token (1P)
#     SLACK_ALERT_CHANNEL=C0B6MPN1U3U     # #systems-check
#
# Cron:  */5 * * * * /opt/rsg-carrierhub/ops/healthcheck.sh >/dev/null 2>&1
# Test:  ./ops/healthcheck.sh --test   (forces a down+recovery alert pair)
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1     # -> /opt/rsg-carrierhub
[ -f .env.ops ] && { set -a; . ./.env.ops; set +a; }

NAME="Carrier Hub"
HEALTH_URL="${HEALTH_URL:-http://localhost:3200/api/health}"
CONTAINER="${CONTAINER:-rsg-carrierhub}"
STATE_FILE="${STATE_FILE:-/var/tmp/carrierhub-health.state}"
HOST="$(hostname)"

post() {  # $1 = text
  [ -n "${SLACK_BOT_TOKEN:-}" ] && [ -n "${SLACK_ALERT_CHANNEL:-}" ] || { echo "no slack creds; would post: $1"; return 0; }
  curl -s -m 10 -X POST https://slack.com/api/chat.postMessage \
    -H "Authorization: Bearer $SLACK_BOT_TOKEN" -H 'Content-Type: application/json; charset=utf-8' \
    --data "$(python3 -c 'import json,sys; print(json.dumps({"channel":sys.argv[1],"text":sys.argv[2]}))' "$SLACK_ALERT_CHANNEL" "$1")" >/dev/null
}

# --- self-test: prove the down+recovery alert path, then restore real state ---
if [ "${1:-}" = "--test" ]; then
  echo "up" > "$STATE_FILE"
  post "🔴 *$NAME DOWN* on $HOST — (SELF-TEST, ignore) /api/health returned 000."
  post "🟢 *$NAME recovered* on $HOST — (SELF-TEST, ignore)."
  rm -f "$STATE_FILE"
  echo "self-test alerts sent to Slack; state reset."
  exit 0
fi

# --- probe with transient-blip retry ---
ok=false; code=000
for attempt in 1 2 3; do
  code=$(curl -s -m 8 -o /tmp/ch_health.json -w '%{http_code}' "$HEALTH_URL" 2>/dev/null || echo 000)
  if [ "$code" = "200" ] && grep -q '"status":"ok"' /tmp/ch_health.json 2>/dev/null; then ok=true; break; fi
  sleep 3
done

prev="$(cat "$STATE_FILE" 2>/dev/null || echo unknown)"
now=$([ "$ok" = true ] && echo up || echo down)
echo "$now" > "$STATE_FILE"

if [ "$now" = down ] && [ "$prev" != down ]; then
  logs="$(docker logs --tail=6 "$CONTAINER" 2>&1 | tr '\n' ' ' | tail -c 350)"
  post "🔴 *$NAME DOWN* on $HOST — \`$HEALTH_URL\` returned $code. Recent logs: $logs  →  ssh hermes; cd /opt/rsg-carrierhub; docker logs $CONTAINER; ./deploy.sh (or roll back to rsg-carrierhub:rollback)."
elif [ "$now" = up ] && [ "$prev" = down ]; then
  post "🟢 *$NAME recovered* on $HOST — $HEALTH_URL OK."
fi
