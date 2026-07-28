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

  // Delete a carrier and its dependent rows. No ON DELETE CASCADE is assumed, so
  // children (contacts, appetite) are removed first, then the carrier itself.
  app.delete("/api/carriers/:id", async (req, res) => {
    if (!db) return res.status(503).json({ error: "Carrier store not configured on the server" });
    const id = String(req.params.id || "").trim();
    if (!id) return res.status(400).json({ error: "carrier id is required" });

    for (const child of ["carrier_contacts", "carrier_appetite"] as const) {
      const { error } = await db.from(child).delete().eq("carrier_id", id);
      if (error) {
        console.error(`DELETE /api/carriers ${child}:`, error.message);
        return res.status(500).json({ error: error.message });
      }
    }
    const { error } = await db.from("carriers").delete().eq("id", id);
    if (error) {
      console.error("DELETE /api/carriers:", error.message);
      return res.status(500).json({ error: error.message });
    }
    res.json({ ok: true });
  });

  // ---- Class codes: what a code IS (carrier_appetite holds who WRITES it) ----
  // The code tables (gl_class_codes 1,154 / wc_class_codes 499) already carry the
  // official manual descriptions. What they lack is the search layer — search_keywords
  // was populated on zero GL rows — so the reverse lookup is what these endpoints add,
  // and POST fills that layer rather than standing up a parallel dictionary.

  // Search / reverse lookup. `q` accepts a code ("91341", "ISO 91341") or a plain
  // business description ("finish carpentry, cabinets") and returns ranked candidates.
  app.get("/api/class-codes", async (req, res) => {
    if (!db) return res.status(503).json({ error: "Carrier store not configured on the server" });
    const q = (req.query.q ?? "").toString().trim();
    const system = (req.query.system ?? "").toString().trim().toLowerCase();
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const rows = await loadCodeTables(db, system);
    if ("error" in rows) {
      console.error("GET /api/class-codes:", rows.error);
      return res.status(500).json({ error: rows.error });
    }
    const ranked = q ? rankClassCodes(rows.codes, q).slice(0, limit) : rows.codes.slice(0, limit);
    res.json({ query: q || null, count: ranked.length, codes: ranked });
  });

  // One code in full, the related codes it's easily confused with, and who writes it.
  app.get("/api/class-codes/:code", async (req, res) => {
    if (!db) return res.status(503).json({ error: "Carrier store not configured on the server" });
    const wanted = normalizeClassCode(req.params.code);
    const system = (req.query.system ?? "").toString().trim().toLowerCase();
    if (!wanted) return res.status(400).json({ error: "a class code is required" });

    const loaded = await loadCodeTables(db, system);
    if ("error" in loaded) {
      console.error("GET /api/class-codes/:code:", loaded.error);
      return res.status(500).json({ error: loaded.error });
    }
    const all = loaded.codes;
    const code = all.find((r) => normalizeClassCode(r.code) === wanted);
    if (!code) {
      return res.status(404).json({
        error: `No class code ${req.params.code} in gl_class_codes or wc_class_codes.`,
        hint: "Carrier-proprietary codes (e.g. CNA Connect) live on the appetite bridge, not the manual tables.",
      });
    }

    // Related codes: same manual family — "Carpentry--Interior" sits beside
    // "Carpentry--Shop Only" and "Carpentry--Construction of Residential...". These
    // are the neighbours a misclassification actually lands on, and they're derived
    // from the manual description itself rather than a hand-maintained pair list.
    const family = code.description.split("--")[0].trim().toLowerCase();
    const siblings = all
      .filter((r) => r.system === code.system && r.code !== code.code &&
                     r.description.split("--")[0].trim().toLowerCase() === family)
      .map((r) => ({ code: r.code, description: r.description, notes: r.notes }));

    // Who writes it. The bridge is authoritative — it carries eligibility, state
    // scope, and whether the link came from the carrier's own source or was derived.
    const { data: bridged } = await db
      .from("vw_carrier_appetite_class_resolved")
      .select("*")
      .eq("code", code.code);

    const markets = (bridged ?? []).map((b: any) => ({
      carrier: b.carrier_name,
      carrierId: b.carrier_id,
      lob: b.lob,
      appetiteLevel: b.appetite_level ?? null,
      eligibility: b.eligibility,
      matchMethod: b.match_method,
      confidence: b.link_confidence,
      stateScope: b.state_scope ?? null,
      restrictions: b.restrictions ?? null,
      sourceNote: b.source_note ?? null,
      statesApproved: b.states_approved ?? [],
    }));

    // Legacy path: appetite rows still carrying the code in class_codes[] without a
    // bridge row yet. Surfaced separately so a derived-looking link is never shown
    // with the same authority as an explicitly sourced one.
    const { data: legacy } = await db
      .from("carrier_appetite")
      .select("carrier_id,carrier_name,lob,appetite_level,class_codes")
      .eq("active", true);
    const bridgedKeys = new Set(markets.map((m) => `${m.carrierId}|${m.lob}`));
    const unbridged = (legacy ?? [])
      .filter((a: any) => (a.class_codes ?? []).some((c: any) => normalizeClassCode(c) === wanted))
      .filter((a: any) => !bridgedKeys.has(`${a.carrier_id}|${a.lob}`))
      .map((a: any) => ({
        carrier: a.carrier_name, lob: a.lob, appetiteLevel: a.appetite_level ?? null,
      }));

    res.json({ code, siblings, markets, marketCount: markets.length, unbridged });
  });

  // Fill in what a code means. This is the "add info as needed" path, and it writes
  // to the manual tables themselves — search_keywords / typical businesses / notes,
  // the layer that was empty on every GL row. Fields you omit keep their value.
  app.post("/api/class-codes", async (req, res) => {
    if (!db) return res.status(503).json({ error: "Carrier store not configured on the server" });
    const body = req.body ?? {};
    const incoming = Array.isArray(body) ? body : Array.isArray(body.codes) ? body.codes : [body];

    const saved: any[] = [];
    for (const raw of incoming) {
      const code = (raw?.code ?? "").toString().trim();
      const system = (raw?.system ?? raw?.code_system ?? "gl").toString().trim().toLowerCase();
      if (!code) return res.status(400).json({ error: "each class code needs a `code`" });
      if (system !== "gl" && system !== "wc") {
        return res.status(400).json({ error: `unknown code system '${system}' — use 'gl' or 'wc'` });
      }
      const table = system === "gl" ? "gl_class_codes" : "wc_class_codes";
      const codeCol = system === "gl" ? "gl_code" : "wc_code";

      const { data: priorRows, error: pErr } = await db.from(table).select("*").eq(codeCol, code).limit(1);
      if (pErr) {
        console.error("POST /api/class-codes read:", pErr.message);
        return res.status(500).json({ error: pErr.message });
      }
      const prior = priorRows?.[0];
      if (!prior && !(raw?.description ?? "").toString().trim()) {
        return res.status(400).json({
          error: `${system.toUpperCase()} ${code} isn't in the manual table — a \`description\` is required to add it`,
        });
      }

      // Whitelist the columns a human can fill in. The manual description and the
      // code itself are authoritative; everything here is the search/context layer.
      const writable = system === "gl"
        ? ["description", "category", "subcategory", "search_keywords", "typical_businesses",
           "notes", "residential_only", "combined_allowed", "height_limit_ft", "max_stories"]
        : ["description", "category", "subcategory", "search_keywords", "typical_duties",
           "typical_payroll_type", "notes", "state"];
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      for (const col of writable) if (raw[col] !== undefined) patch[col] = raw[col];

      const { data, error } = prior
        ? await db.from(table).update(patch).eq("id", prior.id).select()
        : await db.from(table).insert({ ...patch, [codeCol]: code }).select();
      if (error) {
        console.error("POST /api/class-codes write:", error.message);
        return res.status(500).json({ error: error.message });
      }
      saved.push({ system, ...(data?.[0] ?? {}) });
    }
    res.json({ ok: true, saved: saved.length, codes: saved });
  });

  // Link a code to a carrier's appetite row — the "who writes it" side, via the
  // bridge that carries eligibility and provenance.
  app.post("/api/class-codes/link", async (req, res) => {
    if (!db) return res.status(503).json({ error: "Carrier store not configured on the server" });
    const b = req.body ?? {};
    const appetiteId = (b.appetiteId ?? b.appetite_id ?? "").toString().trim();
    const code = (b.code ?? "").toString().trim();
    const system = (b.system ?? b.code_system ?? "gl").toString().trim().toLowerCase();
    const eligibility = (b.eligibility ?? "eligible").toString();
    const matchMethod = (b.matchMethod ?? b.match_method ?? "manual").toString();
    if (!appetiteId || !code) {
      return res.status(400).json({ error: "appetiteId and code are required" });
    }
    if (!["eligible", "conditional", "prohibited"].includes(eligibility)) {
      return res.status(400).json({ error: "eligibility must be eligible, conditional, or prohibited" });
    }

    // Resolve the FK to the manual table when the code exists there; a carrier's own
    // proprietary code still links, just unresolved.
    let glId: string | null = null;
    let wcId: string | null = null;
    if (system === "gl") {
      const { data } = await db.from("gl_class_codes").select("id").eq("gl_code", code).limit(1);
      glId = data?.[0]?.id ?? null;
    } else if (system === "wc") {
      const { data } = await db.from("wc_class_codes").select("id").eq("wc_code", code).limit(1);
      wcId = data?.[0]?.id ?? null;
    }

    const { error } = await db.from("carrier_appetite_class_codes").upsert({
      appetite_id: appetiteId, code_system: system, code,
      gl_code_id: glId, wc_code_id: wcId,
      eligibility, match_method: matchMethod,
      confidence: (b.confidence ?? "unverified").toString(),
      state_scope: b.stateScope ?? b.state_scope ?? null,
      restrictions: b.restrictions ?? null,
      source_note: b.sourceNote ?? b.source_note ?? null,
      updated_by: b.updatedBy ?? "carrier-hub-ui",
    }, { onConflict: "appetite_id,code_system,code" });
    if (error) {
      console.error("POST /api/class-codes/link:", error.message);
      return res.status(500).json({ error: error.message });
    }
    res.json({ ok: true, resolved: !!(glId || wcId) });
  });

  // Appointments by line — the panel inverted. "Who can write this?" is usually a
  // question about the appointment list, not about one carrier.
  app.get("/api/appointments", async (req, res) => {
    if (!db) return res.status(503).json({ error: "Carrier store not configured on the server" });
    const want = (req.query.lob ?? "").toString().trim().toLowerCase();

    const [{ data: carriers, error: cErr }, { data: appetite, error: aErr }] = await Promise.all([
      db.from("carriers").select("id,name,general_agent,lines_of_business,is_active").eq("is_active", true).order("name"),
      db.from("carrier_appetite").select("carrier_id,lob,appetite_level,class_codes").eq("active", true),
    ]);
    if (cErr || aErr) {
      const msg = cErr?.message || aErr?.message || "appointment lookup failed";
      console.error("GET /api/appointments:", msg);
      return res.status(500).json({ error: msg });
    }

    const byLine = new Map<string, any[]>();
    for (const c of carriers ?? []) {
      // An appetite row is itself evidence of an appointment on that line, even when
      // lines_of_business on the carrier record hasn't been filled in.
      const lobs = new Set<string>((c.lines_of_business ?? []) as string[]);
      for (const a of appetite ?? []) if (a.carrier_id === c.id && a.lob) lobs.add(a.lob);
      for (const lob of lobs) {
        if (!lob || (want && !lob.toLowerCase().includes(want))) continue;
        const row = (appetite ?? []).find(
          (a: any) => a.carrier_id === c.id && String(a.lob).toLowerCase() === lob.toLowerCase(),
        );
        if (!byLine.has(lob)) byLine.set(lob, []);
        byLine.get(lob)!.push({
          carrierId: c.id,
          carrier: c.name,
          appointment: c.general_agent ? `via ${c.general_agent}` : "direct",
          generalAgent: c.general_agent ?? null,
          appetiteLevel: row?.appetite_level ?? null,
          classCodes: row?.class_codes ?? [],
        });
      }
    }

    const lines = [...byLine.entries()]
      .map(([lob, carriersOnLine]) => ({ lob, count: carriersOnLine.length, carriers: carriersOnLine }))
      .sort((a, b) => a.lob.localeCompare(b.lob));
    res.json({ lineCount: lines.length, lines });
  });

  // API Route - Appetite match (CRM connection point). A CRM Opportunity's risk
  // attributes (lob / state / class code / premium / keywords) in, ranked carrier
  // + program fits out. Deterministic — no LLM — so it can be called from Hermes /
  // the CRM and give repeatable placement suggestions. To close the loop, the
  // caller writes the chosen carrier back onto opportunities.carrier.
  app.post("/api/appetite-match", async (req, res) => {
    if (!db) return res.status(503).json({ error: "Carrier store not configured on the server" });
    const q = (req.body ?? {}) as MatchQuery & { limit?: number };
    if (!q.lob && !q.state && !q.classCode && (q.premium == null || q.premium === ("" as any)) && !q.keywords) {
      return res.status(400).json({ error: "Provide at least one of: lob, state, classCode, premium, keywords" });
    }
    const { data, error } = await db
      .from("carrier_appetite")
      .select("*, carriers(id,name,is_active,general_agent)")
      .eq("active", true);
    if (error) {
      console.error("POST /api/appetite-match:", error.message);
      return res.status(500).json({ error: error.message });
    }
    const limit = Math.min(Number(q.limit) || 10, 50);
    const normState = toStateAbbr(q.state);
    if (normState) q.state = normState; // accept "Georgia" or "GA"
    const matches = matchAppetite(data ?? [], q).slice(0, limit);
    res.json({
      query: {
        lob: q.lob ?? null, state: q.state ?? null, classCode: q.classCode ?? null,
        premium: q.premium ?? null, keywords: q.keywords ?? null,
      },
      count: matches.length,
      matches,
    });
  });

  // API Route - Appetite match FOR a CRM opportunity. Reads the opportunity + its
  // canonical_client (all in this same Supabase DB — the CRM is Supabase-native),
  // builds the risk (lob/state/sic/premium), ranks markets, and — only when
  // `commit: true` and the top match is a positive fit — writes the chosen
  // carrier back to opportunities.carrier. Read-only by default.
  app.post("/api/appetite-match/opportunity", async (req, res) => {
    if (!db) return res.status(503).json({ error: "Carrier store not configured on the server" });
    const opportunityId = (req.body?.opportunityId ?? "").toString().trim();
    const commit = req.body?.commit === true;
    const limit = Math.min(Number(req.body?.limit) || 10, 50);
    if (!opportunityId) return res.status(400).json({ error: "opportunityId is required" });

    // 1) Load the opportunity
    const { data: opp, error: oppErr } = await db
      .from("opportunities")
      .select("id, insured_id, insured_name, line_of_business, premium_estimate, carrier, stage, status")
      .eq("id", opportunityId)
      .maybeSingle();
    if (oppErr) { console.error("appetite-match/opportunity opp:", oppErr.message); return res.status(500).json({ error: oppErr.message }); }
    if (!opp) return res.status(404).json({ error: "opportunity not found" });

    // 2) Enrich risk from canonical_clients (state, SIC) via the nowcerts insured guid
    let client: any = null;
    if (opp.insured_id) {
      const { data: c } = await db
        .from("canonical_clients")
        .select("state, zip, sic, sic_description")
        .eq("nowcerts_insured_guid", opp.insured_id)
        .maybeSingle();
      client = c ?? null;
    }

    const sic = (client?.sic ?? "").toString().trim();
    const risk: MatchQuery = {
      lob: opp.line_of_business ?? "",
      state: toStateAbbr(client?.state),
      classCode: sic,
      premium: opp.premium_estimate != null ? Number(opp.premium_estimate) : null,
      keywords: [opp.line_of_business, client?.sic_description].filter(Boolean).join(" "),
    };

    // 3) Rank markets
    const { data: rows, error } = await db
      .from("carrier_appetite")
      .select("*, carriers(id,name,is_active,general_agent)")
      .eq("active", true);
    if (error) { console.error("appetite-match/opportunity rows:", error.message); return res.status(500).json({ error: error.message }); }
    const matches = matchAppetite(rows ?? [], risk).slice(0, limit);

    // 4) Optional write-back — only a positive top fit, never a weak guess
    let committed: { carrier: string } | null = null;
    if (commit && matches.length && matches[0].score > 0) {
      const top = matches[0];
      const label = top.program ? `${top.carrier} — ${top.program}` : top.carrier;
      const { error: upErr } = await db.from("opportunities").update({ carrier: label }).eq("id", opportunityId);
      if (upErr) { console.error("appetite-match/opportunity write:", upErr.message); return res.status(500).json({ error: upErr.message }); }
      committed = { carrier: label };
    }

    res.json({
      opportunity: {
        id: opp.id, insuredName: opp.insured_name, lob: opp.line_of_business,
        premiumEstimate: opp.premium_estimate, currentCarrier: opp.carrier,
        stage: opp.stage, status: opp.status,
      },
      resolvedRisk: risk,
      clientResolved: !!client,
      committed,
      count: matches.length,
      matches,
    });
  });

  // API Route - Carrier Appetite Assistant
  app.post("/api/advisor", async (req, res) => {
    const { carrierId, carrierName, appetiteInfo, inquiry, history } = req.body;

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
      // Ground the concierge on the LIVE spine, not just the prose the browser
      // sent. The drawer only ever passed canWrite/cannotWrite/notes, so the
      // assistant could not see class codes, states, premium bands, contacts, or
      // the underwriter class-code guides — exactly what carrier questions ask
      // about. Re-read the carrier here and reuse the same formatter Ask the Hub
      // uses. Falls back to the client blob if the id is unknown or the DB is off.
      let spineContext = "";
      if (db && carrierId) {
        const { data: row } = await db
          .from("carriers")
          .select("*, carrier_contacts(*), carrier_appetite(*)")
          .eq("id", String(carrierId))
          .maybeSingle();
        if (row) spineContext = formatDirectory([row]);
      }

      // Prepare system instructions with carrier appetite information
      const carrierContext = spineContext
        ? spineContext
        : appetiteInfo
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

Grounding rules — the context above is this agency's own carrier record, and it wins:
- Answer from it first. Quote the class codes, states, premium bands, requirements, exclusions, and contacts exactly as listed.
- "Class code" lines carry the underwriter's own definition of what a code covers. For any classification question ("which code applies to X?", "91341 or 91340?"), answer from those lines and name the code, its title, and what it covers.
- Never invent class codes, contacts, premium bands, or appetite the record does not show. If something is not listed, say plainly that the record does not show it and name the underwriting contact or hotline from the record to confirm.
- General industry knowledge is fine for context, but label it as general guidance rather than this carrier's stated appetite.

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
      // Same grounding upgrade as /api/advisor: read the live panel (appetite rows,
      // class-code guides, contacts) instead of the truncated 3-bullet summary the
      // browser used to send, which dropped every structured fact.
      let carriersBriefContext = "";
      if (db) {
        const { data: rows } = await db
          .from("carriers")
          .select("*, carrier_contacts(*), carrier_appetite(*)")
          .order("name");
        if (rows?.length) carriersBriefContext = formatDirectory(rows);
      }
      if (!carriersBriefContext) {
        carriersBriefContext = carriersList && Array.isArray(carriersList)
          ? carriersList.map((c: any) => `Carrier: ${c.name}
Segment: ${(c.segment || []).join(", ")}
LOBs: ${(c.linesOfBusiness || []).join(", ")}
✅ Will Write: ${(c.appetite?.canWrite || []).join("; ")}
❌ Won't Write: ${(c.appetite?.cannotWrite || []).join("; ")}`).join("\n---\n")
          : "Standard commercial independent agency carriers panel.";
      }

      const systemInstruction = `You are a helpful, senior Independent Agency Underwriting Consultant.
You help commercial and personal insurance agents identify which carrier(s) from their active panel would be the perfect fit for a certain client risk.

Active Carrier Panel available to check:
${carriersBriefContext}

Analyze the user's risk inquiry: "${inquiry}"
Help them by:
1. Identifying **1-3 Top Carrier Fits** from the panel that have positive appetite markers for this class. Explain why.
2. Flagging any **Definitely Prohibited** carriers that would trigger an instant auto-declination.
3. Suggesting the standard premium codes or class details required across these carriers to build a successful submission.

Grounding rules — the panel above is this agency's own record of its appointments, and it wins:
- Only recommend carriers that appear in the panel. Never invent carriers, class codes, contacts, or appetite.
- "Class code" lines carry an underwriter's own definition of what a code covers — use them to answer classification questions and to say which carriers list that code.
- When asked who can write a given class code or line, answer carrier by carrier and group by line of business, naming the appointment (direct or through the listed general agent).
- If no carrier in the panel lists it, say so plainly rather than guessing, and suggest the closest appetite plus who to call.

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
        // Class-code definitions the underwriter gave us (details.class_code_guide).
        // These carry the "what does this code actually cover" text, which is what
        // classification questions ("91341 or 91340?") are really asking for.
        for (const g of (a.details?.class_code_guide ?? []) as any[]) {
          const sys = g.code_system ? `${g.code_system} ` : "";
          const parts = [`${sys}${g.code} — ${g.title}`];
          if (g.use_for) parts.push(`use for: ${g.use_for}`);
          if (g.not_for) parts.push(`not for: ${g.not_for}`);
          lines.push(`    Class code [${a.lob}] ${parts.join(" | ")}`);
        }
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

// Deterministic appetite matcher — the connection point a CRM Opportunity hits.
// Given a risk (lob / state / class code / premium / keywords) it scores every
// carrier_appetite row and returns ranked carrier+program fits with the reasons
// it fit and cautions to verify (state gaps, premium band, exclusion hits). This
// is the structured counterpart to the LLM advisors: same data, but repeatable.
interface MatchQuery {
  lob?: string; state?: string; classCode?: string;
  premium?: number | null; keywords?: string;
}

// A class code normalized across the two manual tables, which use different column
// names (gl_code/wc_code, typical_businesses/typical_duties) for the same idea.
interface NormalizedCode {
  id: string; system: "gl" | "wc"; code: string; description: string;
  category: string | null; subcategory: string | null;
  searchKeywords: string | null; typicalOf: string | null; notes: string | null;
  residentialOnly: boolean | null; maxStories: number | null; state: string | null;
  score: number; why: string[];
}

async function loadCodeTables(
  db: SupabaseClient, system: string,
): Promise<{ codes: NormalizedCode[] } | { error: string }> {
  const wantGl = !system || system === "gl";
  const wantWc = !system || system === "wc";
  const [gl, wc] = await Promise.all([
    wantGl
      ? db.from("gl_class_codes").select("id,gl_code,description,category,subcategory,search_keywords,typical_businesses,notes,residential_only,max_stories")
      : Promise.resolve({ data: [], error: null } as any),
    wantWc
      ? db.from("wc_class_codes").select("id,wc_code,description,category,subcategory,search_keywords,typical_duties,notes,state")
      : Promise.resolve({ data: [], error: null } as any),
  ]);
  if (gl.error || wc.error) return { error: gl.error?.message || wc.error?.message || "code lookup failed" };

  const codes: NormalizedCode[] = [
    ...(gl.data ?? []).map((r: any) => ({
      id: r.id, system: "gl" as const, code: r.gl_code, description: r.description ?? "",
      category: r.category ?? null, subcategory: r.subcategory ?? null,
      searchKeywords: r.search_keywords ?? null, typicalOf: r.typical_businesses ?? null,
      notes: r.notes ?? null, residentialOnly: r.residential_only ?? null,
      maxStories: r.max_stories ?? null, state: null, score: 0, why: [],
    })),
    ...(wc.data ?? []).map((r: any) => ({
      id: r.id, system: "wc" as const, code: r.wc_code, description: r.description ?? "",
      category: r.category ?? null, subcategory: r.subcategory ?? null,
      searchKeywords: r.search_keywords ?? null, typicalOf: r.typical_duties ?? null,
      notes: r.notes ?? null, residentialOnly: null, maxStories: null,
      state: r.state ?? null, score: 0, why: [],
    })),
  ];
  return { codes };
}

// Reverse lookup: a business description in, ranked candidate class codes out.
// This is the query that actually saves a rewritten submission — the producer knows
// what the business DOES, not what it classifies as. An exact code match short-
// circuits to the top; otherwise it's token overlap weighted by where the token hit.
function rankClassCodes(rows: NormalizedCode[], query: string): NormalizedCode[] {
  const wantedCode = normalizeClassCode(query);
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOP.has(t));

  return rows
    .map((r) => {
      let score = 0;
      const why: string[] = [];

      if (wantedCode && normalizeClassCode(r.code) === wantedCode) {
        score += 100;
        why.push(`Exact code match (${r.system.toUpperCase()} ${r.code})`);
      }

      const weighted: [string, number, string][] = [
        [(r.description ?? "").toLowerCase(), 4, "manual description"],
        [(r.searchKeywords ?? "").toLowerCase(), 3, "keywords"],
        [(r.typicalOf ?? "").toLowerCase(), 3, "typical businesses"],
        [(r.notes ?? "").toLowerCase(), 2, "notes"],
        [`${r.category ?? ""} ${r.subcategory ?? ""}`.toLowerCase(), 1, "category"],
      ];
      const hitFields = new Set<string>();
      for (const t of terms) {
        for (const [hay, weight, label] of weighted) {
          if (hay && hay.includes(t)) {
            score += weight;
            hitFields.add(label);
            break; // count each term once, at its strongest field
          }
        }
      }
      if (hitFields.size) why.push(`Matched on ${[...hitFields].join(", ")}`);
      // Be explicit when a code has no search layer yet — a thin row ranking low is
      // a gap in our data, not evidence the code is wrong for the risk.
      if (!r.searchKeywords && !r.typicalOf && !r.notes && score > 0) {
        why.push("Manual description only — no keywords recorded for this code yet");
      }

      return { ...r, score, why };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);
}

// Class codes get typed a dozen ways — "ISO 91341", "91341", "91-341", "sic 8721".
// Compare on the bare alphanumeric code so a stored "91341" still matches a search
// for "ISO 91341", which otherwise silently returned nothing.
function normalizeClassCode(v: any): string {
  return String(v ?? "")
    .toUpperCase()
    .replace(/\b(ISO|NCCI|SIC|NAICS|CLASS|CODE)\b/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

function matchAppetite(rows: any[], q: MatchQuery) {
  const terms = (q.keywords || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
  const state = (q.state || "").toUpperCase().trim();
  const lob = (q.lob || "").toLowerCase().trim();
  const cls = normalizeClassCode(q.classCode);
  const premium = q.premium != null && q.premium !== ("" as any) ? Number(q.premium) : null;

  const scored = rows.map((r) => {
    let score = 0;
    const reasons: string[] = [];
    const cautions: string[] = [];
    const detailsStr = JSON.stringify(r.details || {}).toLowerCase();
    const family = (r.details?.lob_family || "").toString().toLowerCase();

    if (lob) {
      const rowLob = (r.lob || "").toLowerCase();
      if (rowLob && (rowLob.includes(lob) || lob.includes(rowLob))) {
        score += 4; reasons.push(`LOB match: ${r.lob}`);
      } else if (family && (family.includes(lob) || lob.includes(family))) {
        score += 2; reasons.push(`LOB family: ${r.details.lob_family}`);
      }
    }

    if (state) {
      const states = (r.states_approved || []).map((s: string) => String(s).toUpperCase());
      const mono = (r.details?.monopolistic_states_excluded || []).map((s: any) => String(s).toUpperCase());
      if (mono.includes(state)) { score -= 5; cautions.push(`${state} is excluded/monopolistic for this program`); }
      else if (states.length === 0) { score += 1; reasons.push(`No state restriction listed (assume broad / US)`); }
      else if (states.includes(state)) { score += 3; reasons.push(`Approved in ${state}`); }
      else { score -= 2; cautions.push(`${state} not in approved states (${states.join(", ")})`); }
    }

    if (cls) {
      const codes = (r.class_codes || []).map(normalizeClassCode);
      if (codes.includes(cls)) {
        score += 4;
        // Surface the underwriter's own definition of the code when we have it,
        // so the finder says WHY it fits, not just that the code is listed.
        const guide = ((r.details?.class_code_guide ?? []) as any[])
          .find((g) => normalizeClassCode(g.code) === cls);
        reasons.push(guide?.title ? `Class code ${cls} eligible — ${guide.title}` : `Class code ${cls} eligible`);
      }
    }

    if (premium != null && !Number.isNaN(premium) && (r.min_premium != null || r.max_premium != null)) {
      const lo = r.min_premium != null ? Number(r.min_premium) : null;
      const hi = r.max_premium != null ? Number(r.max_premium) : null;
      if (lo != null && premium < lo) { score -= 2; cautions.push(`Premium $${premium} below program min $${lo}`); }
      else if (hi != null && premium > hi) { score -= 2; cautions.push(`Premium $${premium} above program max $${hi}`); }
      else { score += 2; reasons.push(`Premium $${premium} within band`); }
    }

    let kwHits = 0;
    const exStr = JSON.stringify(r.exclusions || []).toLowerCase();
    for (const t of terms) {
      if ((r.lob || "").toLowerCase().includes(t) || (r.notes || "").toLowerCase().includes(t) || detailsStr.includes(t)) kwHits++;
      if (exStr.includes(t)) { score -= 3; cautions.push(`"${t}" appears in this program's exclusions — verify`); }
    }
    if (kwHits) { score += kwHits; reasons.push(`Matched ${kwHits} keyword(s)`); }

    return {
      carrierId: r.carrier_id,
      carrier: r.carriers?.name || r.carrier_name,
      program: r.lob,
      generalAgent: r.carriers?.general_agent ?? null,
      appetiteLevel: r.appetite_level ?? null,
      minPremium: r.min_premium ?? null,
      maxPremium: r.max_premium ?? null,
      score, reasons, cautions,
    };
  });

  return scored
    .filter((m) => m.score > 0 || m.reasons.length > 0)
    .sort((a, b) => b.score - a.score);
}

// The custom CRM stores state as a full name ("Georgia"); appetite states_approved
// are USPS codes ("GA"). Normalize so the matcher compares like for like.
const US_STATE_ABBR: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", "district of columbia": "DC",
  florida: "FL", georgia: "GA", hawaii: "HI", idaho: "ID", illinois: "IL",
  indiana: "IN", iowa: "IA", kansas: "KS", kentucky: "KY", louisiana: "LA",
  maine: "ME", maryland: "MD", massachusetts: "MA", michigan: "MI", minnesota: "MN",
  mississippi: "MS", missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
  "north carolina": "NC", "north dakota": "ND", ohio: "OH", oklahoma: "OK",
  oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI", wyoming: "WY",
};

function toStateAbbr(s: any): string {
  const t = (s ?? "").toString().trim();
  if (!t) return "";
  if (t.length === 2) return t.toUpperCase();
  return US_STATE_ABBR[t.toLowerCase()] || "";
}

  // API Route - Ask the Hub: grounded Q&A over the FULL live directory + class guides.
  app.post("/api/hub-query", async (req, res) => {
    const inquiry = (req.body?.inquiry ?? "").toString().trim();
    const history = Array.isArray(req.body?.history) ? req.body.history : [];
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
        .select("*, carrier_contacts(*), carrier_appetite(*)")
        .order("name");
      if (error) throw error;

      // 2) Selective class-code retrieval (only rows relevant to the question).
      const guides = loadClassGuides();
      const matched = searchClassGuides(guides, inquiry);

      // 2b) The manual class-code tables — what a code IS, independent of who writes
      // it. Only the codes relevant to this question, so the prompt stays small
      // against 1,650+ rows.
      const loadedCodes = await loadCodeTables(db, "");
      const dictHits = "codes" in loadedCodes
        ? rankClassCodes(loadedCodes.codes, inquiry).slice(0, 8)
        : [];
      const dictCtx = dictHits.length
        ? dictHits.map((c) => {
            const bits = [`${c.system.toUpperCase()} ${c.code} — ${c.description}`];
            if (c.category || c.subcategory) bits.push(`  category: ${[c.category, c.subcategory].filter(Boolean).join(" / ")}`);
            if (c.typicalOf) bits.push(`  typical: ${c.typicalOf}`);
            if (c.notes) bits.push(`  notes: ${c.notes}`);
            if (c.maxStories) bits.push(`  max stories: ${c.maxStories}`);
            if (c.state) bits.push(`  state: ${c.state}`);
            return bits.join("\n");
          }).join("\n")
        : "none matched";

      // 2c) Carrier↔code links from the bridge, which carries eligibility and
      // whether the link came from the carrier's own source or was derived.
      const codeList = dictHits.map((c) => c.code);
      const { data: bridgeRows } = codeList.length
        ? await db.from("vw_carrier_appetite_class_resolved").select("*").in("code", codeList)
        : { data: [] as any[] };
      const bridgeCtx = (bridgeRows ?? []).length
        ? (bridgeRows ?? []).map((b: any) =>
            `${b.code} → ${b.carrier_name} (${b.lob}): ${b.eligibility}` +
            `${b.state_scope ? ` [${b.state_scope} only]` : ""}` +
            `${b.restrictions ? ` — ${b.restrictions}` : ""}` +
            ` (${b.match_method}, ${b.link_confidence})`,
          ).join("\n")
        : "no carrier is linked to these codes yet";

      const directoryCtx = formatDirectory(carriers ?? []);
      const classCtx = matched.length ? formatClassRows(matched) : "none matched";

      const systemInstruction = `You are the RSG Carrier Hub assistant — a senior commercial-lines underwriting consultant for Risk Solutions Group, an independent agency in Atlanta, GA. Answer the agent's question using ONLY the data provided below.

You are in an ongoing conversation with the agent, so follow-ups ("what about their work comp?", "who do I call there?", "and in Florida?") refer back to what you were both just discussing. Carry that context forward instead of asking them to restate it.

Rules:
- Ground every answer in the directory. Cite the carrier name (and class code + SIC where a class-code row was used).
- For contact questions, return the contact name, role, email, and phone exactly as listed. If the carrier has no contact on file, say so and give the underwriting hotline, website, or agent login instead.
- "Class code" lines carry an underwriter's own definition of what a code covers. Use them to answer classification questions ("which code applies to finish carpentry?", "91341 or 91340?") — name the code, its title, what it covers, and which carrier it came from.
- When asked who can write a class code or line of business, answer carrier by carrier grouped by line, and say whether the appointment is direct or through the listed general agent. If nothing in the panel lists it, say so plainly and give the closest appetite plus who to call.
- If a carrier, appetite, contact, or class code is not in the data, say so plainly. Never invent carriers, contacts, class codes, or appetite details. General industry knowledge is fine as context, but label it as general guidance rather than this agency's record.
- For placement questions: give 1-3 best-fit carriers with a one-line "why", flag any definitely-prohibited carriers, and list the next data points to gather for a submission.
- Keep it tight and scannable — short paragraphs or short bullets. Use markdown headings only when they help. Answer conversationally; skip headings entirely for a one-line question.

=== LIVE CARRIER DIRECTORY (${(carriers ?? []).length} carriers, with appetite + contacts) ===
${directoryCtx}

=== RELEVANT CLASS-CODE DATA (matched from carrier profile guides) ===
${classCtx}

=== CLASS-CODE REFERENCE (gl_class_codes / wc_class_codes — the manual descriptions) ===
${dictCtx}

=== CARRIER ↔ CLASS-CODE LINKS (who writes these codes, and on what terms) ===
${bridgeCtx}

Codes and carrier links are two different facts. A code tells you how the operation
classifies; a link tells you which carrier will write it and whether it's eligible,
conditional, or prohibited. Never infer one from the other. "explicit_source" means the
carrier stated it; "keyword"/"embedding" means we derived it — flag derived links as
needing confirmation. Anything absent from these sections is not on file: say so rather
than reciting a class code from memory.`;

      // Prior turns ride along so the hub holds a conversation about a carrier
      // rather than answering each question cold.
      const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: systemInstruction },
      ];
      for (const m of history.slice(-12)) {
        messages.push({
          role: m?.role === "assistant" ? "assistant" : "user",
          content: String(m?.content ?? ""),
        });
      }
      messages.push({ role: "user", content: inquiry });

      const response = await llm.client.chat.completions.create({
        model: llm.model,
        messages,
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
