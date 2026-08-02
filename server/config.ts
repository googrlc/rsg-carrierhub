// Carrier Hub owns its own configuration.
//
// This app used to read Hermes's environment directly (HERMES_OPENAI_*), which
// made it a component of Hermes rather than a service Hermes runs. Everything it
// needs now arrives under CARRIERHUB_* (plus the standard SUPABASE_* pair), and
// nothing here reads another service's variables.

import dotenv from "dotenv";

// `.env.local` first, then `.env` — first file to define a key wins, matching how
// Vite resolves the client-side vars. The README has always told you to create
// `.env.local`, but the server only ever read `.env`, so a local run silently came
// up with no Supabase credentials. In the container neither file exists and every
// value arrives as a real env var, which dotenv leaves alone.
dotenv.config({ path: [".env.local", ".env"], quiet: true });

export const APP_NAME = "rsg-carrierhub";
export const APP_TITLE = "RSG Carrier Hub";
export const APP_VERSION = "1.0.0";

// First non-empty value wins. Blank strings count as unset — an env var exported
// as "" in a shell wrapper should fall through, not silently disable the key.
function pick(...names: string[]): string {
  for (const n of names) {
    const v = process.env[n];
    if (v && v.trim() !== "") return v.trim();
  }
  return "";
}

export const PORT = Number(process.env.PORT) || 3000;

export const supabaseConfig = {
  // VITE_SUPABASE_URL is accepted because the same URL is baked into the client
  // bundle; the service-role key is server-only and has no VITE_ equivalent.
  url: pick("SUPABASE_URL", "VITE_SUPABASE_URL"),
  serviceRoleKey: pick("SUPABASE_SERVICE_ROLE_KEY"),
};

// The portal's LLM calls differ a lot in how much intelligence they need, and
// paying one rate for all of them is the avoidable cost. Each task resolves its
// model independently so a tier can be re-pointed on the LiteLLM proxy without a
// redeploy — the point of routing through a proxy rather than pinning a model in
// code. Every tier defaults to the SAME single model the app already used, so
// deploying this changes nothing until the model groups actually exist. Pointing
// at a group the proxy doesn't define would 404 every call.
export type LLMTask = "desk" | "advisor" | "quick";

const DEFAULT_MODEL = "gpt-4.1-mini";

// CARRIERHUB_* only — no fallback to HERMES_OPENAI_* / LITELLM_* / OPENAI_*.
// Those existed to carry the running container through the rename; the box moved
// over on 2026-08-02 and they're gone. A generic OPENAI_API_KEY sitting in the
// environment for some other tool must not silently become the key this app bills
// against, and an unset key is a warning at startup plus a visible state in
// /api/health — a much better failure than quietly using the wrong credential.
export const llmConfig = {
  apiKey: pick("CARRIERHUB_LLM_API_KEY"),
  baseURL: pick("CARRIERHUB_LLM_BASE_URL"),
  modelFor(task: LLMTask): string {
    const perTask: Record<LLMTask, string> = {
      // Ask Carrier Desk — grounded, conversational, large cached prefix.
      desk: "CARRIERHUB_MODEL_DESK",
      // Per-carrier and panel-wide appetite advisors.
      advisor: "CARRIERHUB_MODEL_ADVISOR",
      // Short, low-stakes completions. Cheapest tier that still reads well.
      quick: "CARRIERHUB_MODEL_QUICK",
    };
    return pick(perTask[task], "CARRIERHUB_LLM_MODEL") || DEFAULT_MODEL;
  },
};

// The MCP door. Fails closed: with no token set, the endpoint still answers but
// refuses every call with a message saying why, rather than serving the write
// tools unauthenticated to anything that can reach the port.
export const mcpConfig = {
  token: pick("CARRIERHUB_MCP_TOKEN"),
  get enabled(): boolean {
    return this.token !== "";
  },
};

export const KEY_MISSING_HINT =
  "the LLM key isn't set — provide `CARRIERHUB_LLM_API_KEY` as a runtime env";
