# RSG Carrier Hub

The Carrier Hub is Risk Solutions Group's portal and single source of truth for
carrier knowledge — directory, contacts, appetite/guidelines, bulletins,
worksheets, commission, and submissions. It is a **Supabase-backed** React +
Express app, deployed via Docker on the **hermes-gretch box** and reachable over
the RSG tailnet at **`:3200`**. It replaces the retired Google AI Studio / Cloud
Run static app.

- **Stack:** React 19 + Vite + Tailwind v4 + Express, TypeScript. Server code is
  in [`server/`](server/); `server.ts` is just the entry point.
- **Data:** Supabase (`rsg-infrastructure`, ref `wibscqhkvpijzqbhjphg`). In the
  deployed build the browser never talks to Supabase directly — it calls the
  box's server-side `/api/carriers` (service-role key); the public Supabase
  endpoint stays fully RLS-locked.
- **Access:** **no sign-in screen** — the app is gated by **Tailscale membership**
  (the host firewall accepts `:3200` on `tailscale0` only). Grant/revoke by
  adding or removing a device from the tailnet; no allowlist, no password.
- **AI advisor:** `/api/advisor` + `/api/global-advisor` call an
  OpenAI-compatible endpoint (LiteLLM proxy), replacing the old Gemini call.
- **Ask Carrier Desk:** `/api/hub-query` — the conversational desk. Grounded on the
  live directory (carriers, appetite rows, contacts) plus the class-code reference;
  accepts `history` so follow-ups keep context.

## A standalone app; Hermes is the runner

Carrier Hub is a service, not a Hermes component. It owns its data access, its
LLM client, and its own configuration (`CARRIERHUB_*`), and it runs and answers
on its own. Hermes starts it and calls it; nothing here reaches back into Hermes.

Every capability is defined once, in the **function registry** at
[`server/functions/`](server/functions/) — a name, a description an agent can
pick from, a Zod input schema, and a handler. Two doors are generated from that
one list, so a capability can never exist on one and not the other:

| Door | For | Auth |
|---|---|---|
| `/api/*` | the browser UI and plain HTTP callers | none — the tailnet is the gate |
| `POST /mcp` | an agent, over MCP (Streamable HTTP, stateless) | `Authorization: Bearer $CARRIERHUB_MCP_TOKEN` |

```bash
GET  /api/health           # identity, store status, function count, MCP state
GET  /api/functions        # the whole surface, with JSON Schema inputs
POST /api/functions/:name  # invoke any function generically
```

The MCP door **fails closed**: with no `CARRIERHUB_MCP_TOKEN` set it refuses
every call (`-32001`) rather than serving the write tools — including
`delete_carrier` — to anything that can reach the port. Tools carry
`readOnlyHint` / `destructiveHint` annotations so a client can confirm before a
destructive call.

Adding a capability means adding one entry to the registry. It appears on both
doors automatically.

```bash
# list the tools
curl -s localhost:3200/mcp -X POST \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H "Authorization: Bearer $CARRIERHUB_MCP_TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

> MCP-over-HTTP normally reports protocol problems in the JSON-RPC body. This
> door sets a matching HTTP status **as well** (401 on a bad token, 405 on GET),
> so a smoke test can key on either.

### Connecting Hermes / Claude to it

Point the client **straight at this door** — do not proxy it through the Hermes
bridge:

```
URL:    https://hermes-gretch.tail1cbc83.ts.net:8445/mcp
Header: Authorization: Bearer <CARRIERHUB_MCP_TOKEN from /opt/rsg-carrierhub/.env.deploy>
```

Tailnet-only, on a real auto-renewing Let's Encrypt cert (Tailscale issues it for
the `.ts.net` name), so there is no self-signed exception to carry around.

**Why direct rather than a bridge proxy.** The tool list here is generated from
the function registry, so a new capability shows up in `tools/list` with no work
anywhere else — that property is the whole point of the registry. A bridge proxy
would have to reimplement it in `app-rsg-hermes-mcp-1:/app/app.py`, live in that
bridge's source to survive a rebuild, and adds a hop that fails when either side
is down. The one-door rule exists to prevent hand-written per-capability bridge
tools; connecting directly avoids those entirely. The trade is real though —
this is a second connector with its own bearer, so rotating
`CARRIERHUB_MCP_TOKEN` means re-authing the client, with no grace period.

## Carrier knowledge API

Separate tables answer separate questions. **A code tells you how an operation
classifies; a link tells you who will write it.** Never infer one from the other.

| Table | Question it answers |
|---|---|
| `carriers` + `carrier_contacts` | Who we're appointed with, who to call, portal logins |
| `carrier_appetite` | Appetite by line — premium bands, states, exclusions |
| `gl_class_codes` (1,154) / `wc_class_codes` (499) | What a class code **is** — the manual description |
| `carrier_appetite_class_codes` | The **bridge**: which carrier writes which code, and on what terms |

| Endpoint | MCP tool | Use |
|---|---|---|
| `GET /api/class-codes/all` | `list_class_codes` | **Every** code with its description, paged (`limit` up to 2000, `total` tells you how many). The exhaustive dump |
| `GET /api/class-codes?q=` | `search_class_codes` | Search by code (`91341`, `ISO 91341`) **or** by description (`cabinets and countertops`) — the reverse lookup, ranked |
| `GET /api/class-codes/:code` | `get_class_code` | One code + the neighbouring codes in its manual family + who writes it |
| `POST /api/class-codes` | `save_class_code` | Fill in `search_keywords` / typical businesses / notes on a manual code. Omitted fields keep their value |
| `POST /api/class-codes/link` | `link_class_code` | Link a code to a carrier's appetite row with eligibility + provenance |
| `GET /api/appointments?lob=` | `appointments_by_line` | The panel inverted — appointments by line, direct vs. via a GA |
| `POST /api/appetite-match` | `match_appetite` | Deterministic risk → ranked carrier/program fits |
| `POST /api/appetite-match/opportunity` | `match_opportunity_appetite` | Same, but the risk is built from a CRM opportunity; optional write-back |
| `GET`/`POST` `/api/carriers`, `DELETE /api/carriers/:id` | `list_carriers`, `get_carrier`, `save_carrier`, `delete_carrier` | The directory itself |
| `POST /api/hub-query` | `ask_carrier_desk` | Grounded conversational Q&A over everything above |
| `POST /api/advisor`, `POST /api/global-advisor` | `carrier_advisor`, `panel_advisor` | One carrier's appetite / the whole panel |

Both class-code tables are read with explicit paging. `gl_class_codes` is 1,154
rows, past PostgREST's default 1,000-row page, and a truncated dictionary is
indistinguishable from a code we don't cover — so `list_class_codes` really does
return all 1,653.

The manual descriptions are already loaded; the gap is the **search layer**
(`search_keywords` was populated on 0 of 1,154 GL rows), which is what makes
describing an operation find the right code. `POST /api/class-codes` fills that in.

On the bridge, `match_method` is load-bearing: `explicit_source` means the carrier's
own source states the code, `keyword`/`embedding` means we derived it. Derived links
are annotation and tiebreaker only — never presented as carrier-verified appetite.

> **Branch:** everything is on **`main`** (Supabase + auth + Docker + LiteLLM). The
> old pre-Supabase AI Studio / Gemini export was consolidated away — there is no
> `supabase-migration` branch anymore.

---

**Operators:** see [RUNBOOK.md](RUNBOOK.md) for deploy, rollback, config, and health monitoring on the box.

## Run locally

**Prerequisites:** Node.js 22+, and access to the Supabase project.

```bash
git clone https://github.com/googrlc/rsg-carrierhub.git
cd rsg-carrierhub

cp .env.example .env.local     # then fill in the values (see below)
npm install
npm run dev                    # Express + Vite dev middleware on http://localhost:3000
```

`npm run dev` runs with the local Supabase publishable key. Note the **deployed**
portal has **no login** — access is gated by the tailnet and carrier data is
served by the box's `/api/carriers` (service-role, server-side). See
[RUNBOOK.md](RUNBOOK.md) → *Access model*.

### Environment variables

Everything the app reads is documented in [`.env.example`](.env.example). Summary:

| Variable | When | Required | Purpose |
|---|---|---|---|
| `VITE_SUPABASE_URL` | build | ✅ | Supabase project URL (browser-safe). Plain `SUPABASE_URL` also works. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | build | ✅ | Browser-safe publishable/anon key (RLS-protected). Plain `SUPABASE_PUBLISHABLE_KEY` also works. |
| `SUPABASE_SERVICE_ROLE_KEY` | runtime | ✅ on the box | Server-side DB access. Missing → carrier endpoints 503. Never shipped to the browser. |
| `CARRIERHUB_LLM_API_KEY` | runtime | ⛔ optional | Key for the AI advisors. Missing key → advisors report unavailable; the rest of the app works. |
| `CARRIERHUB_LLM_BASE_URL` | runtime | ⛔ optional | Point the advisors at the LiteLLM proxy. Omit for direct OpenAI. |
| `CARRIERHUB_LLM_MODEL` | runtime | ⛔ optional | Global model default, `gpt-4.1-mini`. Per-task overrides: `CARRIERHUB_MODEL_DESK` / `_ADVISOR` / `_QUICK`. |
| `CARRIERHUB_MCP_TOKEN` | runtime | ⛔ optional | Bearer token for `POST /mcp`. Unset → the MCP door refuses every call. `openssl rand -hex 32`. |
| `PORT` | runtime | ⛔ optional | Listen port, default `3000`. |

`CARRIERHUB_*` is the **only** set read. There is deliberately no fallback to
`HERMES_OPENAI_*` / `LITELLM_API_KEY` / `OPENAI_API_KEY` — a key sitting in the
environment for another tool must not silently become the one this app bills
against. An unset key warns at startup and is visible in `/api/health`.

**Where to get the values:**
- **Supabase URL + publishable key** — Supabase Dashboard → project
  `wibscqhkvpijzqbhjphg` → **Project Settings → API keys**. The publishable key
  (`sb_publishable_...`, or the legacy `anon`/public key) is browser-safe.
- **LiteLLM / OpenAI key** — the LiteLLM proxy virtual key, read with
  `op read "op://rsg-infrastructure/Litellm_vk/text"`, or any OpenAI key for a
  direct call. The vault is `rsg-infrastructure` with **hyphens**; the related
  items are `Litellm_vk` (the API key), `litellm admin login`, and `litellm_ssh`.

> ⚠️ The Supabase **service_role** key is never needed to run the portal and must
> never be committed or shipped to the browser. RLS handles all browser access.

## Build & run production

```bash
npm run build      # vite build + esbuild bundles server.ts -> dist/server.cjs
NODE_ENV=production npm run start   # node dist/server.cjs, serves ./dist on :3000
npm run lint       # tsc --noEmit
```

`NODE_ENV=production` makes Express serve the built bundle from `./dist`; any
other value runs the Vite dev middleware.

## Docker / deployment

The image bakes the browser-safe Supabase URL + publishable key at build time via
build args; runtime secrets (the LLM key, service-role key) are passed as env at
`docker run`.

### Live deployment (hermes-gretch box)

The app is deployed on the **hermes-gretch box** (`hermes` in `~/.ssh/config`) at
`/opt/rsg-carrierhub`, which is a **git checkout of `main`** (pulls via a
read-only deploy key). The container runs on `3200:3000`, `restart=unless-stopped`.

**Redeploy is one command** — [`deploy.sh`](deploy.sh) pulls, rebuilds (old
container keeps serving), swaps, health-checks, and keeps a rollback image:

```bash
ssh hermes
cd /opt/rsg-carrierhub && ./deploy.sh
```

Runtime + build config lives in `/opt/rsg-carrierhub/.env.deploy` (gitignored,
`chmod 600`) — `deploy.sh` sources it. To route the AI advisor through the
**LiteLLM proxy** (its own Elestio VPS) instead of calling OpenAI directly, set:

```
CARRIERHUB_LLM_BASE_URL=https://<litellm-vps>/v1
CARRIERHUB_LLM_API_KEY=<litellm virtual key>
CARRIERHUB_LLM_MODEL=gpt-4.1-mini
CARRIERHUB_MCP_TOKEN=<openssl rand -hex 32>   # opens POST /mcp
```

then run `./deploy.sh`. (Supabase build args default inside `deploy.sh`; override
in `.env.deploy` if they ever rotate.)

> `deploy.sh` rewrites itself via its own `git pull`. When a commit changes
> `deploy.sh`, the **first** run executes the old script — bash already read it —
> so a newly added `-e` flag silently misses the container while the health check
> still passes. Run it twice on those deploys and confirm via `/api/health`.

**Access:** reachable **only** over Tailscale at `http://100.75.67.72:3200` or
`http://hermes-gretch:3200`. This is the intended access gate — the host firewall
accepts `:3200` on `tailscale0` only, and no `elestio-nginx` server block fronts
it (unlike the Commission Tracker at
`https://hermes-gretch-u69864.vm.elestio.app:18445`). See [RUNBOOK.md](RUNBOOK.md).

## Troubleshooting

- **Blank grid / "Supabase is not configured" in the console** — `VITE_SUPABASE_URL`
  or `VITE_SUPABASE_PUBLISHABLE_KEY` was empty *at build time*. These are baked in
  by Vite, so rebuild (`npm run dev` / `npm run build`) after setting them; setting
  them only at runtime has no effect on the client bundle.
- **Blank grid / zero carriers (deployed)** — `/api/carriers` is returning 503
  because `SUPABASE_SERVICE_ROLE_KEY` is missing in `.env.deploy`. Set it and
  `./deploy.sh`. Check: `curl -s localhost:3200/api/carriers | head -c 200`.
- **"AI Advisor Unavailable"** — no LLM key resolved. Set `CARRIERHUB_LLM_API_KEY`
  as a **runtime** env, not a build arg.
- **`/mcp` refuses everything with `-32001`** — either `CARRIERHUB_MCP_TOKEN` is
  unset on the server (the door fails closed by design) or the caller's bearer is
  wrong. The JSON-RPC `message` says which.
- **Edits don't persist (deployed)** — `POST /api/carriers` failing; check
  `docker logs rsg-carrierhub` for the Supabase error (service-role key valid?).
- **Can't reach it from your Mac** — expected; it's tailnet-only. Use Tailscale,
  or `ssh hermes` and hit `localhost:3200`.
- **Port** — the server listens on `3000` (hardcoded in `server.ts`); map/proxy
  accordingly.
- **Health check** — `GET /api/health` returns `{ "status": "ok", ... }`.

---

## RSG Ops Notes (July 2026)

- **Status:** Migrated off the retired Cloud Run static app
  (`carrier-appetite-submission-portal-339396843209`) to this Supabase-backed
  portal, deployed on the hermes-gretch box (tailnet `:3200`). This repo — not
  AI Studio — is the source of truth.
- **Data spine:** Supabase `rsg-infrastructure` (`wibscqhkvpijzqbhjphg`).
  `carriers` + `carrier_contacts` are live; the appetite/guidelines/bulletins/
  worksheets/submissions tables and search RPCs are per the build spec (in
  progress). Commission data: view `portal_carrier_commissions` ← `commission_rules`,
  matched to carriers via `match_key`.
- **Onyx (appetite knowledge base):** https://onyx-1t6jv-u69864.vm.elestio.app/app/agents
- **Rule:** No real carrier portal passwords in this app — login URLs only;
  credentials stay in 1Password (vault `rsg-infrastructure`).
- **Verify before trusting:** underwriter contact names seeded from the original
  `src/data/carriers.ts` were AI-generated during the build and may be fictional.
