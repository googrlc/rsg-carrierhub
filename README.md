# RSG Carrier Hub

The Carrier Hub is Risk Solutions Group's portal and single source of truth for
carrier knowledge — directory, contacts, appetite/guidelines, bulletins,
worksheets, commission, and submissions. It is a **Supabase-backed** React +
Express app, deployed via Docker on Elestio. It replaces the retired Google AI
Studio / Cloud Run static app.

- **Stack:** React 19 + Vite + Tailwind v4 + Express (`server.ts`), TypeScript.
- **Data:** Supabase (`rsg-infrastructure`, ref `wibscqhkvpijzqbhjphg`) via the
  browser JS client, RLS-gated by the publishable key.
- **Auth:** Supabase Auth, access gated by the shared `app_allowlist`
  (`is_commission_user` / `is_commission_admin` helpers — same allowlist as the
  Commission Tracker).
- **AI advisor:** `/api/advisor` + `/api/global-advisor` call an
  OpenAI-compatible endpoint (Hermes LiteLLM proxy), replacing the old Gemini call.

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

Sign in with a magic link / OTP using an email that is in `app_allowlist`
(Lamar = admin, Gretchen = user). Non-allowlisted emails authenticate but see no
carriers (RLS returns zero rows).

### Environment variables

Everything the app reads is documented in [`.env.example`](.env.example). Summary:

| Variable | When | Required | Purpose |
|---|---|---|---|
| `VITE_SUPABASE_URL` | build | ✅ | Supabase project URL (browser-safe). Plain `SUPABASE_URL` also works. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | build | ✅ | Browser-safe publishable/anon key (RLS-protected). Plain `SUPABASE_PUBLISHABLE_KEY` also works. |
| `HERMES_OPENAI_API_KEY` *(or `LITELLM_API_KEY` / `OPENAI_API_KEY`)* | runtime | ⛔ optional | Key for the AI advisor. Missing key → advisor shows "AI Advisor Unavailable"; the rest of the app works. |
| `HERMES_OPENAI_BASE_URL` *(or `OPENAI_BASE_URL` / `LITELLM_BASE_URL`)* | runtime | ⛔ optional | Point the advisor at the LiteLLM proxy. Omit for direct OpenAI. |
| `HERMES_OPENAI_MODEL` | runtime | ⛔ optional | Advisor model, default `gpt-4.1-mini`. |

**Where to get the values:**
- **Supabase URL + publishable key** — Supabase Dashboard → project
  `wibscqhkvpijzqbhjphg` → **Project Settings → API keys**. The publishable key
  (`sb_publishable_...`, or the legacy `anon`/public key) is browser-safe.
- **LiteLLM / OpenAI key** — the Hermes LiteLLM proxy key (1Password vault
  `rsg_infrastructure`), or any OpenAI key for a direct call.

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

## Docker / Elestio

The image bakes the browser-safe Supabase URL + publishable key at build time via
build args; runtime secrets (the LLM key) are passed as env at `docker run`.

### Live deployment (Elestio / hermes-gretch box)

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
HERMES_OPENAI_BASE_URL=https://<litellm-vps>/v1
HERMES_OPENAI_API_KEY=<litellm virtual key>
HERMES_OPENAI_MODEL=gpt-4.1-mini
```

then run `./deploy.sh`. (Supabase build args default inside `deploy.sh`; override
in `.env.deploy` if they ever rotate.)

**Access:** reachable over Tailscale at `http://100.75.67.72:3200` or
`http://hermes-gretch:3200`. There is **no public HTTPS URL yet** — unlike the
Commission Tracker (`https://hermes-gretch-u69864.vm.elestio.app:18445`), no
`elestio-nginx` server block fronts `:3200`. Add one to expose it publicly.

## Troubleshooting

- **Blank grid / "Supabase is not configured" in the console** — `VITE_SUPABASE_URL`
  or `VITE_SUPABASE_PUBLISHABLE_KEY` was empty *at build time*. These are baked in
  by Vite, so rebuild (`npm run dev` / `npm run build`) after setting them; setting
  them only at runtime has no effect on the client bundle.
- **Logged in but zero carriers** — the signed-in email isn't in `app_allowlist`,
  or RLS is blocking. Reads are gated on `is_commission_user()`. Add the email to
  `app_allowlist` in Supabase.
- **"AI Advisor Unavailable"** — no LLM key resolved. Set `HERMES_OPENAI_API_KEY`
  (or `LITELLM_API_KEY` / `OPENAI_API_KEY`) as a **runtime** env, not a build arg.
- **Edits don't persist** — `saveCarrier` write-through needs an **admin**
  (`is_commission_admin`) email; non-admins can edit in-session but the write is
  swallowed. Check the allowlist `is_admin` flag.
- **Port** — the server listens on `3000` (hardcoded in `server.ts`); map/proxy
  accordingly.
- **Health check** — `GET /api/health` returns `{ "status": "ok", ... }`.

---

## RSG Ops Notes (July 2026)

- **Status:** Migrating off the retired Cloud Run static app
  (`carrier-appetite-submission-portal-339396843209`) to this Supabase-backed
  Elestio portal. This repo — not AI Studio — is now the source of truth.
- **Data spine:** Supabase `rsg-infrastructure` (`wibscqhkvpijzqbhjphg`).
  `carriers` + `carrier_contacts` are live; the appetite/guidelines/bulletins/
  worksheets/submissions tables and search RPCs are per the build spec (in
  progress). Commission data: view `portal_carrier_commissions` ← `commission_rules`,
  matched to carriers via `match_key`.
- **Onyx (appetite knowledge base):** https://onyx-1t6jv-u69864.vm.elestio.app/app/agents
- **Rule:** No real carrier portal passwords in this app — login URLs only;
  credentials stay in 1Password (`rsg_infrastructure`).
- **Verify before trusting:** underwriter contact names seeded from the original
  `src/data/carriers.ts` were AI-generated during the build and may be fictional.
