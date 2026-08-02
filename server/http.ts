import type { Express, Response } from "express";
import { APP_NAME, APP_VERSION, mcpConfig } from "./config";
import { callFunction, describeFunctions, FunctionError, makeContext } from "./functions";
import { saveOneClassCode } from "./functions/class-codes";
import { resolveSupabase } from "./supabase";

// HTTP routes are thin adapters over the function registry: map the request onto
// a function input, run it, shape the reply. The route paths and response bodies
// are unchanged from before the refactor, because the browser UI depends on them.

function fail(res: Response, e: unknown, where: string) {
  if (e instanceof FunctionError) {
    if (e.status >= 500) console.error(`${where}:`, e.message);
    return res.status(e.status).json({ error: e.message, ...(e.details ?? {}) });
  }
  const msg = (e as any)?.message ?? String(e);
  console.error(`${where}:`, msg);
  return res.status(500).json({ error: msg });
}

/** Run a registry function and send its result as the JSON body. */
async function run(res: Response, name: string, input: unknown) {
  try {
    res.json(await callFunction(name, input, makeContext("http")));
  } catch (e) {
    fail(res, e, `${name} (http)`);
  }
}

export function registerHttpRoutes(app: Express): void {
  // Health / identity. Says what this app is and what it can do, so a runner can
  // confirm the service is itself and not just that a port answers.
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      app: APP_NAME,
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
      store: resolveSupabase() ? "connected" : "not configured",
      functions: describeFunctions().length,
      mcp: mcpConfig.enabled ? "enabled" : "no token configured",
    });
  });

  // The function surface, described. The same list the MCP door exposes as tools.
  app.get("/api/functions", (_req, res) => {
    res.json({ app: APP_NAME, version: APP_VERSION, functions: describeFunctions() });
  });

  // Generic invoker, so a caller that already read /api/functions doesn't need a
  // hand-written route per capability.
  app.post("/api/functions/:name", async (req, res) => {
    await run(res, req.params.name, req.body ?? {});
  });

  // ---- Carrier directory ----
  app.get("/api/carriers", async (_req, res) => run(res, "list_carriers", {}));
  app.post("/api/carriers", async (req, res) => run(res, "save_carrier", req.body ?? {}));
  app.delete("/api/carriers/:id", async (req, res) => run(res, "delete_carrier", { id: req.params.id }));

  // ---- Class codes ----
  app.get("/api/class-codes", async (req, res) => {
    try {
      const out: any = await callFunction("search_class_codes", {
        q: (req.query.q ?? "").toString().trim() || undefined,
        system: (req.query.system ?? "").toString().trim().toLowerCase() || undefined,
        limit: Math.min(Number(req.query.limit) || 20, 500),
        offset: Number(req.query.offset) || 0,
      }, makeContext("http"));
      res.json(out);
    } catch (e) {
      fail(res, e, "GET /api/class-codes");
    }
  });

  // Every code and description in one place, paged.
  app.get("/api/class-codes/all", async (req, res) => {
    await run(res, "list_class_codes", {
      system: (req.query.system ?? "").toString().trim().toLowerCase() || undefined,
      limit: Number(req.query.limit) || undefined,
      offset: Number(req.query.offset) || 0,
      startsWith: (req.query.startsWith ?? "").toString().trim() || undefined,
    });
  });

  app.get("/api/class-codes/:code", async (req, res) => {
    await run(res, "get_class_code", {
      code: req.params.code,
      system: (req.query.system ?? "").toString().trim().toLowerCase() || undefined,
    });
  });

  // Accepts one code or a batch — the batch form is what the UI's bulk editor
  // sends, so it stays a route concern rather than widening the function's input.
  app.post("/api/class-codes", async (req, res) => {
    const db = resolveSupabase();
    if (!db) return res.status(503).json({ error: "Carrier store not configured on the server" });
    const body = req.body ?? {};
    const incoming = Array.isArray(body) ? body : Array.isArray(body.codes) ? body.codes : [body];
    try {
      const saved: any[] = [];
      for (const raw of incoming) saved.push(await saveOneClassCode(db, raw));
      res.json({ ok: true, saved: saved.length, codes: saved });
    } catch (e) {
      fail(res, e, "POST /api/class-codes");
    }
  });

  app.post("/api/class-codes/link", async (req, res) => {
    const b = req.body ?? {};
    await run(res, "link_class_code", {
      appetiteId: (b.appetiteId ?? b.appetite_id ?? "").toString(),
      code: (b.code ?? "").toString(),
      system: (b.system ?? b.code_system ?? "gl").toString().toLowerCase(),
      eligibility: b.eligibility ?? undefined,
      matchMethod: (b.matchMethod ?? b.match_method) ?? undefined,
      confidence: b.confidence ?? undefined,
      stateScope: b.stateScope ?? b.state_scope ?? undefined,
      restrictions: b.restrictions ?? undefined,
      sourceNote: b.sourceNote ?? b.source_note ?? undefined,
      updatedBy: b.updatedBy ?? "carrier-hub-ui",
    });
  });

  // ---- Appetite / placement ----
  app.get("/api/appointments", async (req, res) => {
    await run(res, "appointments_by_line", { lob: (req.query.lob ?? "").toString() });
  });

  app.post("/api/appetite-match", async (req, res) => {
    const b = req.body ?? {};
    await run(res, "match_appetite", {
      lob: b.lob || undefined,
      state: b.state || undefined,
      classCode: b.classCode || undefined,
      // The form posts an empty string for a blank premium field.
      premium: b.premium === "" || b.premium == null ? undefined : Number(b.premium),
      keywords: b.keywords || undefined,
      limit: b.limit ? Number(b.limit) : undefined,
    });
  });

  app.post("/api/appetite-match/opportunity", async (req, res) => {
    const b = req.body ?? {};
    await run(res, "match_opportunity_appetite", {
      opportunityId: (b.opportunityId ?? "").toString(),
      commit: b.commit === true,
      limit: b.limit ? Number(b.limit) : undefined,
    });
  });

  // ---- Grounded answers ----
  app.post("/api/advisor", async (req, res) => {
    const b = req.body ?? {};
    await run(res, "carrier_advisor", {
      carrierId: b.carrierId ? String(b.carrierId) : undefined,
      carrierName: b.carrierName ? String(b.carrierName) : undefined,
      inquiry: (b.inquiry ?? "").toString(),
      history: normalizeHistory(b.history),
    });
  });

  app.post("/api/global-advisor", async (req, res) => {
    const b = req.body ?? {};
    await run(res, "panel_advisor", {
      inquiry: (b.inquiry ?? "").toString(),
      carriersList: Array.isArray(b.carriersList) ? b.carriersList : undefined,
    });
  });

  app.post("/api/hub-query", async (req, res) => {
    const b = req.body ?? {};
    await run(res, "ask_carrier_desk", {
      inquiry: (b.inquiry ?? "").toString(),
      history: normalizeHistory(b.history),
    });
  });
}

// The chat components send loosely-typed history; coerce it before it hits the
// schema so a stray role doesn't 400 a whole conversation.
function normalizeHistory(h: unknown) {
  if (!Array.isArray(h)) return undefined;
  return h.map((m: any) => ({
    role: m?.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: String(m?.content ?? ""),
  }));
}
