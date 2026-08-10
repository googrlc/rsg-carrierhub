# AGENTS.md

## Cursor Cloud specific instructions

RSG Carrier Hub is a single full-stack TypeScript app (React 19 + Vite + Express,
Node.js 22, npm). `server.ts` is only the entry point; the server lives in
`server/`. Standard commands are in `package.json` and `README.md`; the notes
below are the non-obvious things.

### Running it

- Dev server: `npm run dev` (`tsx server.ts`). This is a **single process** —
  Express mounts the Vite dev middleware itself, so there is no separate Vite
  server. It listens on `http://0.0.0.0:3000` (override with `PORT`). Health
  check: `GET /api/health`.
- Lint: `npm run lint` is a **TypeScript type-check only** (`tsc --noEmit`).
  There is no ESLint/Prettier and no automated test suite (`npm test` does not
  exist).
- Prod (rarely needed for dev): `npm run build` then
  `NODE_ENV=production npm run start`. `NODE_ENV=production` makes Express serve
  the built `./dist` bundle instead of the Vite middleware.

### Runs without secrets, but degrades — know what breaks

The app boots fine with no env vars (it just logs `WARN:` lines). What is
unavailable without secrets:

- **No `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`** → every carrier-store
  endpoint returns `503`. That disables the **Active Appointments** grid
  (`/api/carriers`), **Find Markets** (appetite match), **Class Codes**, and
  **Appointments**. The **Submissions "New Proposal"** form is also unusable
  because its required "Target Carrier" dropdown is populated from
  `/api/carriers`.
- **No `CARRIERHUB_LLM_API_KEY`** → **Ask Carrier Desk** and the carrier/panel
  **AI advisors** report themselves unavailable. Only `CARRIERHUB_*` env names
  are read — there is deliberately no fallback to `OPENAI_API_KEY` /
  `LITELLM_*` / `HERMES_OPENAI_*`.
- **No `CARRIERHUB_MCP_TOKEN`** → the `POST /mcp` door fails closed and refuses
  every call (`-32001`).

What works with **no secrets** (local seed data / `localStorage`): the
**Launchpad**, **Guideline Bulletins** (publish/remove), **User Profile &
Favorites**, and the submissions list itself once seeded. These are good targets
for a smoke test when Supabase credentials are not configured.

### Config gotchas

- The server reads `.env.local` first, then `.env` (`server/config.ts`, via
  `dotenv`). In a container all values arrive as real env vars instead.
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` are **baked into the
  client bundle at build time** by `vite.config.ts`. Setting them only at
  runtime has no effect on the browser bundle — restart `npm run dev` (or
  rebuild) after changing them.
- To enable the Supabase-backed features locally, copy `.env.example` to
  `.env.local` and fill in the values (see `README.md` for where to get them).
