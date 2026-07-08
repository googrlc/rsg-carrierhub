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
HERMES_OPENAI_BASE_URL=https://litellm-qidsf-u69864.vm.elestio.app/v1
HERMES_OPENAI_API_KEY=<litellm virtual key>          # 1P rsg_infrastructure/litellm_virtualkey
HERMES_OPENAI_MODEL=gpt-4.1-mini                      # or claude-sonnet / claude-opus / deepseek-v4-flash
# VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY default inside deploy.sh; override here if rotated
```

Change the advisor model or route → edit `.env.deploy`, run `./deploy.sh`.

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
| Blank grid / "Supabase is not configured" | `VITE_SUPABASE_*` empty **at build time** (baked by Vite). Fix in `.env.deploy`, `./deploy.sh`. |
| Logged in but zero carriers | email not in `app_allowlist` (reads gated on `is_commission_user()`). Add it in Supabase. |
| "AI Advisor Unavailable" | no LLM key resolved → check `HERMES_OPENAI_API_KEY` in `.env.deploy`. |
| Advisor errors / 500 | LiteLLM proxy issue. Test: `curl -H "Authorization: Bearer <key>" https://litellm-qidsf-u69864.vm.elestio.app/v1/models`. Check the litellm box. |
| Edits don't persist | write-through needs an **admin** (`is_commission_admin`) email. |
| Can't reach it from your Mac | public/off-tailnet is firewalled — that's expected. Use Tailscale, or `ssh hermes` and hit `localhost:3200`. |

## Access to GitHub from the box

`/opt/rsg-carrierhub` pulls via a **read-only deploy key** (`~/.ssh/carrierhub_deploy`,
SSH alias `github-carrierhub`). It can `git pull` but not push — edits happen from
your dev clone, pushed to `main`, then `git pull` on the box.
