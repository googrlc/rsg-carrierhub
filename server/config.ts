// Carrier Hub owns its own configuration.
//
// This app used to read Hermes's environment directly (HERMES_OPENAI_*), which
// made it a component of Hermes rather than a service Hermes runs. The canonical
// names are now CARRIERHUB_*; the old names are kept as a fallback so an already
// running container keeps working through the rename and can be migrated on the
// next deploy rather than in lockstep with it.

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
  url: pick("CARRIERHUB_SUPABASE_URL", "SUPABASE_URL", "VITE_SUPABASE_URL"),
  serviceRoleKey: pick("CARRIERHUB_SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_ROLE_KEY"),
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

export const llmConfig = {
  apiKey: pick(
    "CARRIERHUB_LLM_API_KEY",
    "HERMES_OPENAI_API_KEY",
    "LITELLM_API_KEY",
    "OPENAI_API_KEY",
  ),
  baseURL: pick(
    "CARRIERHUB_LLM_BASE_URL",
    "HERMES_OPENAI_BASE_URL",
    "OPENAI_BASE_URL",
    "LITELLM_BASE_URL",
  ),
  modelFor(task: LLMTask): string {
    const perTask: Record<LLMTask, string[]> = {
      // Ask Carrier Desk — grounded, conversational, large cached prefix.
      desk: ["CARRIERHUB_MODEL_DESK", "HERMES_MODEL_DESK"],
      // Per-carrier and panel-wide appetite advisors.
      advisor: ["CARRIERHUB_MODEL_ADVISOR", "HERMES_MODEL_ADVISOR"],
      // Short, low-stakes completions. Cheapest tier that still reads well.
      quick: ["CARRIERHUB_MODEL_QUICK", "HERMES_MODEL_QUICK"],
    };
    return (
      pick(...perTask[task], "CARRIERHUB_LLM_MODEL", "HERMES_OPENAI_MODEL") ||
      DEFAULT_MODEL
    );
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
  "the LLM key isn't set — provide `CARRIERHUB_LLM_API_KEY` as a runtime env " +
  "(the legacy `HERMES_OPENAI_API_KEY` is still read as a fallback)";
