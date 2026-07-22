import express from "express";
import path from "path";
import fs from "fs";
import { randomUUID } from "node:crypto";
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

// Sync a carrier's underwriting contacts to `carrier_contacts`. The drawer edits
// contacts inline and sends the full desired list on save, so we treat that list
// as the source of truth: upsert everything the client sent, then delete any rows
// for this carrier it no longer lists. Without this the carrier row persisted but
// contacts never did — they vanished on the next reload.
async function syncCarrierContacts(
  db: SupabaseClient,
  carrierId: string,
  contacts: any[],
): Promise<void> {
  const incoming = (contacts ?? [])
    .filter((c) => c && (c.id || c.name))
    .map((c) => ({
      id: String(c.id ?? `contact-${carrierId}-${Date.now()}`),
      carrier_id: carrierId,
      name: c.name ?? "",
      role: c.role ?? null,
      email: c.email ?? null,
      phone: c.phone ?? null,
      region: c.region ?? null,
    }));

  if (incoming.length) {
    const { error } = await db.from("carrier_contacts").upsert(incoming);
    if (error) throw new Error(`contacts upsert: ${error.message}`);
  }

  // Delete rows for this carrier that are no longer in the client's list.
  const { data: existing, error: exErr } = await db
    .from("carrier_contacts")
    .select("id")
    .eq("carrier_id", carrierId);
  if (exErr) throw new Error(`contacts read: ${exErr.message}`);

  const keep = new Set(incoming.map((c) => c.id));
  const toDelete = (existing ?? [])
    .map((r: any) => r.id)
    .filter((id: string) => !keep.has(id));
  if (toDelete.length) {
    const { error } = await db.from("carrier_contacts").delete().in("id", toDelete);
    if (error) throw new Error(`contacts delete: ${error.message}`);
  }
}

// Sync a carrier's structured appetite rows to `carrier_appetite` (the queryable
// appetite spine). Same source-of-truth model as contacts: upsert the full list
// the client sent, then delete any rows for this carrier it no longer lists. The
// grain is one row per carrier x line-of-business, so we dedupe on LOB and mint a
// uuid for brand-new rows. Only runs when the client explicitly sends the list,
// so calls that don't touch appetite never wipe existing rows.
async function syncCarrierAppetite(
  db: SupabaseClient,
  carrierId: string,
  carrierName: string,
  rows: any[],
): Promise<void> {
  const byLob = new Map<string, any>();
  for (const r of rows ?? []) {
    const lob = (r?.lob ?? "").toString().trim();
    if (!lob) continue; // LOB is the required grain; skip blank rows
    byLob.set(lob.toLowerCase(), {
      id: r.id || randomUUID(),
      carrier_id: carrierId,
      carrier_name: carrierName,
      lob,
      appetite_level: r.appetite_level ?? null,
      min_premium: r.min_premium ?? null,
      max_premium: r.max_premium ?? null,
      states_approved: r.states_approved ?? [],
      key_requirements: r.key_requirements ?? [],
      exclusions: r.exclusions ?? [],
      class_codes: r.class_codes ?? [],
      notes: r.notes ?? null,
      details: r.details ?? {},
      effective_date: r.effective_date ?? null,
      active: r.active ?? true,
      source: r.source ?? "carrier-hub-ui",
      confidence: r.confidence ?? "unverified",
    });
  }
  const incoming = [...byLob.values()];

  if (incoming.length) {
    const { error } = await db.from("carrier_appetite").upsert(incoming);
    if (error) throw new Error(`appetite upsert: ${error.message}`);
  }

  const { data: existing, error: exErr } = await db
    .from("carrier_appetite")
    .select("id")
    .eq("carrier_id", carrierId);
  if (exErr) throw new Error(`appetite read: ${exErr.message}`);

  const keep = new Set(incoming.map((r) => r.id));
  const toDelete = (existing ?? [])
    .map((r: any) => r.id)
    .filter((id: string) => !keep.has(id));
  if (toDelete.length) {
    const { error } = await db.from("carrier_appetite").delete().in("id", toDelete);
    if (error) throw new Error(`appetite delete: ${error.message}`);
  }
}

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
      .select("*, carrier_contacts(*), carrier_appetite(*)")
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

    // Persist the carrier's contacts too (carrier upserted first so the FK holds).
    if (Array.isArray(body.contacts)) {
      try {
        await syncCarrierContacts(db, String(body.id), body.contacts);
      } catch (e: any) {
        console.error("POST /api/carriers contacts:", e.message);
        return res.status(500).json({ error: e.message });
      }
    }

    // Persist structured appetite rows to the queryable spine (same model as
    // contacts). Guarded on presence so a payload that omits appetite_rows never
    // deletes existing rows.
    if (Array.isArray(body.appetite_rows)) {
      try {
        await syncCarrierAppetite(db, String(body.id), String(body.name), body.appetite_rows);
      } catch (e: any) {
        console.error("POST /api/carriers appetite:", e.message);
        return res.status(500).json({ error: e.message });
      }
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


// ---- Hub Query: grounded AI over the live carrier directory + class guides ----
// Keeps the portal "AI queryable" as Lamar continually adds carriers, contacts,
// and appetite: the directory is pulled live from Supabase on every call, and any
// carrier-assets/<id>/profile-guide.json dropped on the box is auto-searched.

const STOP = new Set(["the","and","for","with","what","which","who","whom","any","that","this","these","those","from","into","your","our","you","can","will","are","is","a","an","of","to","in","on","or","do","does","have","has","i","we","me","my","write","writes","writing","appetite","business","small","insurance","carrier","carriers","please","need","want","looking","find","about"]);

// Module-level cache so the box doesn't re-parse the JSON on every request. The
// cache is keyed by carrier-assets folder and refreshed when the file mtime
// changes (a redeploy writes new files and the process picks them up).
const guideCache = new Map<string, { carrierName: string; mtime: number; rows: any[] }>();

function loadClassGuides(): { carrierName: string; rows: any[] }[] {
  const bases = [
    path.join(process.cwd(), "dist", "carrier-assets"),
    path.join(process.cwd(), "public", "carrier-assets"),
  ];
  const seen = new Set<string>();
  const out: { carrierName: string; rows: any[] }[] = [];
  for (const base of bases) {
    let folders: string[] = [];
    try { folders = fs.readdirSync(base); } catch { continue; }
    for (const f of folders) {
      if (seen.has(f)) continue;
      const file = path.join(base, f, "profile-guide.json");
      try { fs.accessSync(file); } catch { continue; }
      seen.add(f);
      const metaFile = path.join(base, f, "meta.json");
      let carrierName = f;
      try { carrierName = JSON.parse(fs.readFileSync(metaFile, "utf8")).carrierName || f; } catch {}
      let mtime = 0;
      try { mtime = fs.statSync(file).mtimeMs; } catch {}
      const cached = guideCache.get(f);
      let rows: any[];
      if (cached && cached.mtime === mtime && cached.carrierName === carrierName) {
        rows = cached.rows;
      } else {
        try { rows = JSON.parse(fs.readFileSync(file, "utf8")); guideCache.set(f, { carrierName, mtime, rows }); }
        catch { rows = []; }
      }
      out.push({ carrierName, rows });
    }
  }
  return out;
}

function searchClassGuides(guides: { carrierName: string; rows: any[] }[], query: string, limit = 15) {
  const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2 && !STOP.has(t));
  if (terms.length === 0) return [];
  const scored: any[] = [];
  for (const g of guides) {
    for (const r of g.rows) {
      const hay = `${r.class_description} ${r.industry_group} ${r.small_business_appetite} ${r.sic} ${r.cna_connect_class_code}`.toLowerCase();
      let score = 0;
      for (const t of terms) if (hay.includes(t)) score += 1;
      if (score > 0) scored.push({ score, carrierName: g.carrierName, ...r });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

function formatDirectory(carriers: any[]): string {
  return carriers
    .map((c) => {
      const lines = [`Carrier: ${c.name} (id: ${c.id})`];
      if (c.lines_of_business?.length) lines.push(`  LOBs: ${c.lines_of_business.join(", ")}`);
      if (c.agency_code) lines.push(`  Agency code: ${c.agency_code}`);
      const aw = c.appetite_can_write || [];
      const an = c.appetite_cannot_write || [];
      if (aw.length) lines.push(`  Will write: ${aw.join(" | ")}`);
      if (an.length) lines.push(`  Won't write: ${an.join(" | ")}`);
      if (c.appetite_notes) lines.push(`  Notes: ${c.appetite_notes}`);
      // Structured appetite spine — the machine-queryable facts per LOB.
      for (const a of c.carrier_appetite || []) {
        const bits: string[] = [];
        if (a.appetite_level) bits.push(a.appetite_level);
        if (a.min_premium != null || a.max_premium != null)
          bits.push(`premium ${a.min_premium ?? "?"}–${a.max_premium ?? "?"}`);
        if (a.states_approved?.length) bits.push(`states: ${a.states_approved.join(",")}`);
        if (a.class_codes?.length) bits.push(`class codes: ${a.class_codes.join(",")}`);
        if (a.key_requirements?.length) bits.push(`requires: ${a.key_requirements.join("; ")}`);
        if (a.exclusions?.length) bits.push(`excludes: ${a.exclusions.join("; ")}`);
        if (a.notes) bits.push(a.notes);
        lines.push(`  Appetite [${a.lob}]: ${bits.join(" | ") || "listed"}`);
      }
      if (c.underwriting_hotline) lines.push(`  Hotline: ${c.underwriting_hotline}`);
      if (c.website) lines.push(`  Website: ${c.website}`);
      if (c.agent_login) lines.push(`  Agent login: ${c.agent_login}`);
      for (const ct of c.carrier_contacts || []) {
        lines.push(`  Contact: ${ct.name} | ${ct.role || ""} | ${ct.email || ""} | ${ct.phone || ""}`);
      }
      return lines.join("\n");
    })
    .join("\n\n");
}

function formatClassRows(rows: any[]): string {
  return rows
    .map(
      (r) =>
        `${r.carrierName} | SIC ${r.sic} | class ${r.cna_connect_class_code} | ${r.industry_group} | ${r.class_description}\n   appetite: ${r.small_business_appetite}\n   products: ${r.products_available}\n   territory: ${r.territorial_restrictions}`,
    )
    .join("\n");
}

  // API Route - Ask the Hub: grounded Q&A over the FULL live directory + class guides.
  app.post("/api/hub-query", async (req, res) => {
    const inquiry = (req.body?.inquiry ?? "").toString().trim();
    if (!inquiry) return res.status(400).json({ error: "Missing inquiry in request body" });

    const llm = resolveLLM();
    if (!llm) {
      return res.status(200).json({
        text: `⚠️ **Ask the Hub unavailable**: ${KEY_MISSING_HINT}.`,
        sources: [],
      });
    }

    if (!db) return res.status(503).json({ error: "Carrier store not configured on the server" });

    try {
      // 1) Live carrier directory (always current — reflects any carrier/contact/appetite edits).
      const { data: carriers, error } = await db
        .from("carriers")
        .select("*, carrier_contacts(*)")
        .order("name");
      if (error) throw error;

      // 2) Selective class-code retrieval (only rows relevant to the question).
      const guides = loadClassGuides();
      const matched = searchClassGuides(guides, inquiry);

      const directoryCtx = formatDirectory(carriers ?? []);
      const classCtx = matched.length ? formatClassRows(matched) : "none matched";

      const systemInstruction = `You are the RSG Carrier Hub assistant — a senior commercial-lines underwriting consultant for Risk Solutions Group, an independent agency in Atlanta, GA. Answer the agent's question using ONLY the data provided below.

Rules:
- Ground every answer in the directory. Cite the carrier name (and class code + SIC where a class-code row was used).
- For contact questions, return the contact name, role, email, and phone exactly as listed.
- If a carrier, appetite, contact, or class code is not in the data, say so plainly. Never invent carriers, contacts, class codes, or appetite details.
- For placement questions: give 1-3 best-fit carriers with a one-line "why", flag any definitely-prohibited carriers, and list the next data points to gather for a submission.
- Keep it tight and scannable — short paragraphs or short bullets. Use markdown headings only when they help.

=== LIVE CARRIER DIRECTORY (${(carriers ?? []).length} carriers, with appetite + contacts) ===
${directoryCtx}

=== RELEVANT CLASS-CODE DATA (matched from carrier profile guides) ===
${classCtx}`;

      const response = await llm.client.chat.completions.create({
        model: llm.model,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: inquiry },
        ],
        temperature: 0.2,
      });

      return res.json({
        text: response.choices[0]?.message?.content ?? "",
        sources: matched.map((m) => ({
          carrier: m.carrierName,
          sic: m.sic,
          classCode: m.cna_connect_class_code,
          classDescription: m.class_description,
        })),
      });
    } catch (err: any) {
      console.error("LiteLLM API Error in /api/hub-query:", err);
      return res.status(500).json({ error: "Ask the Hub failed: " + err.message });
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
