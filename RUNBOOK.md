# Carrier Hub — Ops Runbook

Operator's guide for keeping the Carrier Hub running. For dev/build details see
[README.md](README.md). **Golden rule: the container on the box is ground truth —
laptops and public URLs are conveniences that may be down. When in doubt, SSH in.**

## Where it lives

| Thing | Value |
|---|---|
| Repo | `googrlc/rsg-carrierhub` (private, single `main` branch) |
| Box | hermes-gretch (`ssh hermes` → 100.75.67.72, over Tailscale) |
| Deploy dir | `/opt/rsg-carrierhub` — a **git checkout of `main`** (read-only deploy key) |
| Container | `rsg-carrierhub`, port `3200:3000`, `restart=unless-stopped` |
| Access | `http://100.75.67.72:3200` or `http://hermes-gretch:3200` (Tailscale). No public HTTPS block yet. |
| Data | Supabase `rsg-infrastructure` (`wibscqhkvpijzqbhjphg`) |
| Advisor LLM | RSG LiteLLM proxy `litellm-qidsf-u69864` (tailnet 100.77.168.50) |
| Health alerts | Slack `#systems-check` (`C0B6MPN1U3U`), 5-min cron |

## Everyday commands

```bash
ssh hermes && cd /opt/rsg-carrierhub

docker ps | grep carrierhub            # up? which port?
docker logs --tail=100 rsg-carrierhub  # what's it saying?
curl -s localhost:3200/api/health      # {"status":"ok",...}

git pull && ./deploy.sh                # ship main: pull → build → swap → health-check
```

`deploy.sh` builds the new image while the old container keeps serving, swaps,
health-checks, and tags the previous image `rsg-carrierhub:rollback`.

## Roll back a bad deploy

```bash
docker rm -f rsg-carrierhub
docker run -d --name rsg-carrierhub --restart unless-stopped -p 3200:3000 \
  --env-file .env.deploy rsg-carrierhub:rollback
curl -s localhost:3200/api/health
```

## Configuration — one file

`/opt/rsg-carrierhub/.env.deploy` (root:600, gitignored) is the single source of
truth for runtime + build values. `deploy.sh` sources it.

```
CARRIERHUB_LLM_BASE_URL=https://litellm-qidsf-u69864.vm.elestio.app/v1
CARRIERHUB_LLM_API_KEY=<litellm virtual key>         # 1P rsg_infrastructure/litellm_virtualkey
CARRIERHUB_LLM_MODEL=gpt-4.1-mini                     # or claude-sonnet / claude-opus / deepseek-v4-flash
CARRIERHUB_MCP_TOKEN=<openssl rand -hex 32>          # opens POST /mcp; unset = the door refuses every call
SUPABASE_SERVICE_ROLE_KEY=<service_role key>         # 1P rsg_infrastructure/supabase_rsg_infastructure — powers the carrier endpoints, server-side ONLY
# SUPABASE_URL / VITE_SUPABASE_* default inside deploy.sh; override here if rotated
```

Change the advisor model or route → edit `.env.deploy`, run `./deploy.sh`.

These replace the old `HERMES_OPENAI_*` names. The app still reads the old names
as a fallback, and `deploy.sh` copies whatever the running container has across
on the first deploy — so nothing breaks if `.env.deploy` hasn't been updated yet.
Rename the keys in `.env.deploy` when convenient.

### The MCP door

Carrier Hub serves its own MCP endpoint at `POST /mcp` — one tool per app
function, the same surface `GET /api/functions` describes. It fails closed:
without `CARRIERHUB_MCP_TOKEN` every call is refused, including the read tools.

```bash
# is it open?
curl -s localhost:3200/api/health | grep -o '"mcp":"[^"]*"'

# list the tools
curl -s localhost:3200/mcp -X POST \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H "Authorization: Bearer $CARRIERHUB_MCP_TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Rotating the token: change it in `.env.deploy`, `./deploy.sh`, then update every
client that points at the door — there is no grace period on the old value.

## Access model — no login (tailnet is the gate)

There is **no sign-in screen**. The app is reachable only over the RSG tailnet
(the host firewall accepts `:3200` on `tailscale0` only; public + Elestio HTTPS
do not route to it). The browser never talks to Supabase directly — it calls the
box's `/api/carriers`, which reads/writes the DB with the **service-role key**.
So carrier data is gated by Tailscale membership, while the public Supabase
endpoint stays fully RLS-locked (the shared commission/money tables are
untouched). To grant/revoke access, add or remove the person's device from the
tailnet — no allowlist, no password.

## Health monitoring

`ops/healthcheck.sh` runs every 5 min via root cron and posts to `#systems-check`
**only on a state change** (down / recovery). Secrets live in
`/opt/rsg-carrierhub/.env.ops` (root:600, gitignored): `SLACK_BOT_TOKEN`
(1P `HermesGretch_Slack_bot_token`), `SLACK_ALERT_CHANNEL=C0B6MPN1U3U`.

```bash
crontab -l | grep healthcheck          # confirm it's installed
./ops/healthcheck.sh --test            # fire a test down+recovery pair to Slack
cat /var/tmp/carrierhub-health.state    # current known state (up/down)
```

## Common issues

| Symptom | Cause / fix |
|---|---|
| Container not in `docker ps` | crashed on boot → `docker logs rsg-carrierhub`; usually a bad `.env.deploy`. Fix + `./deploy.sh`, or roll back. |
| Blank grid / zero carriers | `/api/carriers` returning **503** → `SUPABASE_SERVICE_ROLE_KEY` missing in `.env.deploy`. Set it, `./deploy.sh`. Check: `curl -s localhost:3200/api/carriers \| head -c 200`. |
| "AI Advisor Unavailable" | no LLM key resolved → check `CARRIERHUB_LLM_API_KEY` in `.env.deploy`. |
| `/mcp` returns `-32001` | `CARRIERHUB_MCP_TOKEN` unset on the server, or the caller sent the wrong bearer. Read the JSON-RPC `message` — it says which. |
| Advisor errors / 500 | LiteLLM proxy issue. Test: `curl -H "Authorization: Bearer <key>" https://litellm-qidsf-u69864.vm.elestio.app/v1/models`. Check the litellm box. |
| Edits don't persist | `POST /api/carriers` failing → check `docker logs rsg-carrierhub` for the Supabase error (service-role key valid?). |
| Can't reach it from your Mac | public/off-tailnet is firewalled — that's expected. Use Tailscale, or `ssh hermes` and hit `localhost:3200`. |

## Access to GitHub from the box

`/opt/rsg-carrierhub` pulls via a **read-only deploy key** (`~/.ssh/carrierhub_deploy`,
SSH alias `github-carrierhub`). It can `git pull` but not push — edits happen from
your dev clone, pushed to `main`, then `git pull` on the box.
