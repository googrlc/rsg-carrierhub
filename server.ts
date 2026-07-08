import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Server-side Supabase client using the SERVICE ROLE key. This lives ONLY on the
// tailnet-only box and never reaches the browser. It lets the app read/write the
// carrier directory without any per-user login: access is gated by the network
// (Tailscale), and the public Supabase REST endpoint stays fully RLS-locked
// (money/commission tables untouched). See RUNBOOK.md.
function resolveSupabase(): SupabaseClient | null {
  const url =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Columns the UI is allowed to write, mirroring the old client-side upsert. We
// pick explicitly so a stray body key can't inject unexpected columns.
const CARRIER_WRITE_COLUMNS = [
  "id", "name", "is_active", "segment", "lines_of_business", "agency_code",
  "general_agent", "website", "agent_login", "logo_url", "original_logo_path",
  "appetite_can_write", "appetite_cannot_write", "appetite_notes",
  "underwriting_hotline", "incentives", "worksheets",
] as const;

// LiteLLM / OpenAI-compatible client, resolved the SAME way Hermes does
// (hermes/commands/agency_intake.py): optional base URL points at the LiteLLM
// proxy; falls back to a direct OpenAI call when no base URL is set.
function resolveLLM(): { client: OpenAI; model: string } | null {
  const baseURL =
    process.env.HERMES_OPENAI_BASE_URL ||
    process.env.OPENAI_BASE_URL ||
    process.env.LITELLM_BASE_URL ||
    "";
  const apiKey =
    process.env.LITELLM_API_KEY ||
    process.env.HERMES_OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    "";
  const model = process.env.HERMES_OPENAI_MODEL || "gpt-4.1-mini";

  if (!apiKey || apiKey.trim() === "" || apiKey === "MY_OPENAI_API_KEY") {
    return null;
  }

  const client = new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL: baseURL.replace(/\/+$/, "") } : {}),
  });
  return { client, model };
}

const KEY_MISSING_HINT =
  "the LiteLLM/OpenAI key isn't set — provide `HERMES_OPENAI_API_KEY` (or `LITELLM_API_KEY`) as a runtime env, same as Hermes";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const db = resolveSupabase();
  if (!db) {
    console.warn(
      "WARN: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — /api/carriers will return 503",
    );
  }

  // API Route - Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Route - Carrier directory (read). Served by the box using the service
  // role, so the browser needs no Supabase login. Returns raw DB rows (carriers
  // + nested carrier_contacts); the client maps them.
  app.get("/api/carriers", async (_req, res) => {
    if (!db) return res.status(503).json({ error: "Carrier store not configured on the server" });
    const { data, error } = await db
      .from("carriers")
      .select("*, carrier_contacts(*)")
      .order("name");
    if (error) {
      console.error("GET /api/carriers:", error.message);
      return res.status(500).json({ error: error.message });
    }
    res.json({ carriers: data ?? [] });
  });

  // API Route - Carrier directory (write-through for in-app edits/adds).
  app.post("/api/carriers", async (req, res) => {
    if (!db) return res.status(503).json({ error: "Carrier store not configured on the server" });
    const body = req.body ?? {};
    if (!body.id || !body.name) {
      return res.status(400).json({ error: "carrier id and name are required" });
    }
    const row: Record<string, unknown> = {};
    for (const col of CARRIER_WRITE_COLUMNS) {
      if (col in body) row[col] = body[col];
    }
    const { error } = await db.from("carriers").upsert(row);
    if (error) {
      console.error("POST /api/carriers:", error.message);
      return res.status(500).json({ error: error.message });
    }
    res.json({ ok: true });
  });

  // API Route - Carrier Appetite Assistant
  app.post("/api/advisor", async (req, res) => {
    const { carrierName, appetiteInfo, inquiry, history } = req.body;

    if (!inquiry) {
      return res.status(400).json({ error: "Missing inquiry in request body" });
    }

    const llm = resolveLLM();
    if (!llm) {
      return res.status(200).json({
        text: `⚠️ **AI Advisor Unavailable**: The appetite advisor could not run because ${KEY_MISSING_HINT}. \n\n*Context of Carrier analyzed:* **${carrierName || "General Carrier"}**`,
      });
    }

    try {
      // Prepare system instructions with carrier appetite information
      const carrierContext = appetiteInfo
        ? `Carrier Name: ${carrierName}
Segment: ${appetiteInfo.segment || "Commercial / Specialty"}
Lines of Business: ${appetiteInfo.linesOfBusiness ? appetiteInfo.linesOfBusiness.join(", ") : ""}
Carrier Written Appetite ✅:
${appetiteInfo.canWrite ? appetiteInfo.canWrite.map((c: string) => `- ${c}`).join("\n") : "No specific write rules detailed."}

Carrier Prohibited Appetite ❌:
${appetiteInfo.cannotWrite ? appetiteInfo.cannotWrite.map((c: string) => `- ${c}`).join("\n") : "No specific prohibited rules detailed."}

Specialist Notes:
${appetiteInfo.notes || "None."}
`
        : `General multi-carrier guidelines context. Search for matching appetites among commercial, personal, MGA, GA insurance operations.`;

      const systemInstruction = `You are a helpful, expert Senior Commercial Insurance Underwriting Assistant.
Your goal is to evaluate if a specific business risk, driver details/profile, or property description fits within the appetite of the carrier being queried.

Current Carrier Context:
${carrierContext}

Structure your response clearly with:
1. **Appetite Verdict**: One of [✅ WITHIN APPETITE], [⚠️ REFER TO UNDERWRITING], or [❌ PROHIBITED / EXPELLED]. Be honest and trace back to the carrier rules provided or standard industry guidelines.
2. **Key Compliance Analysis**: Briefly explain why it fits or conflicts.
3. **Information to Gather / Recommended Next Steps**: Detail what data points (e.g. roof age, gross sales, claims history, CDL years) the agent should collect to make a successful submission.
Keep your answer professional, concise, styled in structured markdown. Avoid generic fluffy paragraphs; get straight to underwriting criteria.`;

      // Build OpenAI-style chat messages: system + prior history + this inquiry
      const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: systemInstruction },
      ];
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          messages.push({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: String(msg.content ?? ""),
          });
        }
      }
      messages.push({ role: "user", content: inquiry });

      const response = await llm.client.chat.completions.create({
        model: llm.model,
        messages,
        temperature: 0.2, // Low temperature for factual underwriting evaluation
      });

      return res.json({ text: response.choices[0]?.message?.content ?? "" });
    } catch (err: any) {
      console.error("LiteLLM API Error in /api/advisor:", err);
      return res.status(500).json({ error: "Failed to communicate with the underwriter assistant API: " + err.message });
    }
  });

  // API Route - Global Appetite Policy Advisor (for analyzing across all carriers)
  app.post("/api/global-advisor", async (req, res) => {
    const { inquiry, carriersList } = req.body;

    if (!inquiry) {
      return res.status(400).json({ error: "Missing inquiry in request body" });
    }

    const llm = resolveLLM();
    if (!llm) {
      return res.status(200).json({
        text: `⚠️ **AI Advisor Unavailable**: The panel advisor could not run because ${KEY_MISSING_HINT}.`,
      });
    }

    try {
      const carriersBriefContext = carriersList && Array.isArray(carriersList)
        ? carriersList.map((c: any) => `Carrier: ${c.name}
Segment: ${c.segment.join(", ")}
LOBs: ${c.linesOfBusiness.join(", ")}
✅ Will Write: ${(c.appetite?.canWrite || []).slice(0, 3).join("; ")}
❌ Won't Write: ${(c.appetite?.cannotWrite || []).slice(0, 3).join("; ")}`).join("\n---\n")
        : "Standard commercial independent agency carriers panel.";

      const systemInstruction = `You are a helpful, senior Independent Agency Underwriting Consultant.
You help commercial and personal insurance agents identify which carrier(s) from their active panel would be the perfect fit for a certain client risk.

Active Carrier Panel available to check:
${carriersBriefContext}

Analyze the user's risk inquiry: "${inquiry}"
Help them by:
1. Identifying **1-3 Top Carrier Fits** from the panel that have positive appetite markers for this class. Explain why.
2. Flagging any **Definitely Prohibited** carriers that would trigger an instant auto-declination.
3. Suggesting the standard premium codes or class details required across these carriers to build a successful submission.

Keep your response professional, precise, and structured with clear markdown headings.`;

      const response = await llm.client.chat.completions.create({
        model: llm.model,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: inquiry },
        ],
        temperature: 0.3,
      });

      return res.json({ text: response.choices[0]?.message?.content ?? "" });
    } catch (err: any) {
      console.error("LiteLLM API Error in /api/global-advisor:", err);
      return res.status(500).json({ error: "Failed to communicate with the underwriting advisor API: " + err.message });
    }
  });

  // Serve static files in production or hook Vite development middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Express starting in DEVELOPMENT mode with Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Express starting in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve client router fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running cleanly on: http://localhost:${PORT}`);
  });
}

startServer().catch((e) => {
  console.error("Express server startup failed:", e);
});
