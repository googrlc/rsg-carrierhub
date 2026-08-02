import { z } from "zod";
import { defineFunction, requireDb, dbFail, FunctionError } from "./types";
import {
  invalidateClassCodeCache, loadCodeTables, rankClassCodes, type NormalizedCode,
} from "../lib/class-codes";
import { normalizeClassCode } from "../lib/text";
import type { SupabaseClient } from "../supabase";

const systemEnum = z.enum(["gl", "wc"]);

// The manual tables are the app's own class-code dictionary: gl_class_codes and
// wc_class_codes together carry every code and its official description. These
// functions are the complete access path to them — ranked search, one code in
// full, and a straight paged dump of the whole dictionary — so nothing outside
// this app needs to reach into the tables directly.

async function codesOrFail(db: SupabaseClient, system: string): Promise<NormalizedCode[]> {
  const loaded = await loadCodeTables(db, system);
  if ("error" in loaded) throw new FunctionError(loaded.error, 500);
  return loaded.codes;
}

// Trim a code to the fields that answer "what is this code?". The scoring fields
// (score/why) only mean something on a ranked result, so they're dropped here.
function describe(c: NormalizedCode) {
  return {
    system: c.system,
    code: c.code,
    description: c.description,
    category: c.category,
    subcategory: c.subcategory,
    searchKeywords: c.searchKeywords,
    typicalOf: c.typicalOf,
    notes: c.notes,
    residentialOnly: c.residentialOnly,
    maxStories: c.maxStories,
    state: c.state,
  };
}

export const searchClassCodes = defineFunction({
  name: "search_class_codes",
  title: "Search class codes",
  description:
    "Ranked reverse lookup over the GL and WC manual tables. `q` takes either a code " +
    "('91341', 'ISO 91341') or a plain description of what the business does " +
    "('finish carpentry, cabinets') and returns candidate codes with their manual " +
    "descriptions and why each matched. Omit `q` to page through the dictionary in " +
    "table order. For the complete dictionary in one sweep use list_class_codes.",
  input: z.object({
    q: z.string().optional().describe("A code or a description of the operation."),
    system: systemEnum.optional().describe("Restrict to GL or WC. Omit for both."),
    limit: z.number().int().min(1).max(500).optional().describe("Default 20."),
    offset: z.number().int().min(0).optional().describe("Default 0. Only meaningful without `q`."),
  }),
  readOnly: true,
  async handler(input, ctx) {
    const db = requireDb(ctx);
    const q = (input.q ?? "").toString().trim();
    const limit = Math.min(input.limit ?? 20, 500);
    const offset = input.offset ?? 0;

    const codes = await codesOrFail(db, input.system ?? "");
    const ranked = q ? rankClassCodes(codes, q) : codes;
    return {
      query: q || null,
      total: ranked.length,
      offset,
      count: Math.max(0, Math.min(limit, ranked.length - offset)),
      codes: ranked.slice(offset, offset + limit),
    };
  },
});

export const listClassCodes = defineFunction({
  name: "list_class_codes",
  title: "List every class code with its description",
  description:
    "The complete class-code dictionary — every GL and WC code with its official manual " +
    "description, category, keywords and notes. Paged, and `total` tells you how many " +
    "there are so you can walk the whole set. This is the exhaustive listing; use " +
    "search_class_codes when you want the few codes that fit a description.",
  input: z.object({
    system: systemEnum.optional().describe("Restrict to GL or WC. Omit for both."),
    limit: z.number().int().min(1).max(2000).optional()
      .describe("Rows per page. Default 500, max 2000 — the full dictionary is ~1,650 rows."),
    offset: z.number().int().min(0).optional().describe("Default 0."),
    startsWith: z.string().optional()
      .describe("Optional code prefix filter, e.g. '913' for the carpentry family."),
  }),
  readOnly: true,
  async handler(input, ctx) {
    const db = requireDb(ctx);
    const limit = Math.min(input.limit ?? 500, 2000);
    const offset = input.offset ?? 0;
    const prefix = normalizeClassCode(input.startsWith ?? "");

    let codes = await codesOrFail(db, input.system ?? "");
    if (prefix) codes = codes.filter((c) => normalizeClassCode(c.code).startsWith(prefix));
    // Stable order so paging through the dictionary can't skip or repeat a row.
    codes.sort((a, b) => a.system.localeCompare(b.system) || a.code.localeCompare(b.code));

    const page = codes.slice(offset, offset + limit);
    return {
      total: codes.length,
      offset,
      count: page.length,
      hasMore: offset + page.length < codes.length,
      codes: page.map(describe),
    };
  },
});

export const getClassCode = defineFunction({
  name: "get_class_code",
  title: "Get one class code in full",
  description:
    "One class code with its manual description, the sibling codes in the same manual " +
    "family that it is easily confused with, and which carriers write it. Carrier links " +
    "come from the appetite bridge and carry eligibility (eligible / conditional / " +
    "prohibited), state scope, and whether the link was stated by the carrier " +
    "('explicit_source') or derived by us ('keyword' / 'embedding') — derived links need " +
    "confirming. `unbridged` lists appetite rows that name the code but have no bridge " +
    "row yet; treat those as weaker evidence.",
  input: z.object({
    code: z.string().describe("The class code. 'ISO 91341', '91341' and '91-341' all work."),
    system: systemEnum.optional().describe("Restrict the lookup to GL or WC."),
  }),
  readOnly: true,
  async handler(input, ctx) {
    const db = requireDb(ctx);
    const wanted = normalizeClassCode(input.code);
    if (!wanted) throw new FunctionError("a class code is required");

    const all = await codesOrFail(db, input.system ?? "");
    const code = all.find((r) => normalizeClassCode(r.code) === wanted);
    if (!code) {
      throw new FunctionError(
        `No class code ${input.code} in gl_class_codes or wc_class_codes.`,
        404,
        { hint: "Carrier-proprietary codes (e.g. CNA Connect) live on the appetite bridge, not the manual tables." },
      );
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

    return { code, siblings, markets, marketCount: markets.length, unbridged };
  },
});

export const saveClassCode = defineFunction({
  name: "save_class_code",
  title: "Fill in what a class code means",
  description:
    "Write to the manual tables themselves — description, category, search keywords, " +
    "typical businesses, notes. This is the search layer that was empty on every GL row, " +
    "so filling it in is what makes a code findable by description. Fields you omit keep " +
    "their current value. A code that isn't in the table yet is inserted, and then " +
    "`description` is required.",
  input: z.object({
    code: z.string(),
    system: systemEnum.optional().describe("Default 'gl'."),
    description: z.string().optional().describe("Required when adding a code that isn't in the table yet."),
    category: z.string().nullish(),
    subcategory: z.string().nullish(),
    search_keywords: z.string().nullish().describe("Free text the reverse lookup searches."),
    typical_businesses: z.string().nullish().describe("GL only."),
    typical_duties: z.string().nullish().describe("WC only."),
    typical_payroll_type: z.string().nullish().describe("WC only."),
    notes: z.string().nullish(),
    residential_only: z.boolean().nullish().describe("GL only."),
    combined_allowed: z.boolean().nullish().describe("GL only."),
    height_limit_ft: z.number().nullish().describe("GL only."),
    max_stories: z.number().nullish().describe("GL only."),
    state: z.string().nullish().describe("WC only."),
  }),
  readOnly: false,
  async handler(input, ctx) {
    const db = requireDb(ctx);
    const saved = await saveOneClassCode(db, input);
    return { ok: true, saved: 1, codes: [saved] };
  },
});

// Shared by the function above and by the HTTP route, which additionally accepts
// a batch of codes in one request.
export async function saveOneClassCode(db: SupabaseClient, raw: any) {
  const code = (raw?.code ?? "").toString().trim();
  const system = (raw?.system ?? raw?.code_system ?? "gl").toString().trim().toLowerCase();
  if (!code) throw new FunctionError("each class code needs a `code`");
  if (system !== "gl" && system !== "wc") {
    throw new FunctionError(`unknown code system '${system}' — use 'gl' or 'wc'`);
  }
  const table = system === "gl" ? "gl_class_codes" : "wc_class_codes";
  const codeCol = system === "gl" ? "gl_code" : "wc_code";

  const { data: priorRows, error: pErr } = await db.from(table).select("*").eq(codeCol, code).limit(1);
  if (pErr) dbFail("class code read", pErr);
  const prior = priorRows?.[0];
  if (!prior && !(raw?.description ?? "").toString().trim()) {
    throw new FunctionError(
      `${system.toUpperCase()} ${code} isn't in the manual table — a \`description\` is required to add it`,
    );
  }

  // Whitelist the columns a human can fill in. The manual description and the
  // code itself are authoritative; everything here is the search/context layer.
  const writable = system === "gl"
    ? ["description", "category", "subcategory", "search_keywords", "typical_businesses",
       "notes", "residential_only", "combined_allowed", "height_limit_ft", "max_stories"]
    : ["description", "category", "subcategory", "search_keywords", "typical_duties",
       "typical_payroll_type", "notes", "state"];
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  // Explicit null is meaningful — it clears a field — so only an absent key is skipped.
  for (const col of writable) if (raw[col] !== undefined) patch[col] = raw[col];

  const { data, error } = prior
    ? await db.from(table).update(patch).eq("id", prior.id).select()
    : await db.from(table).insert({ ...patch, [codeCol]: code }).select();
  if (error) dbFail("class code write", error);
  // So the edit is visible to the very next lookup, not after the cache expires.
  invalidateClassCodeCache();
  return { system, ...(data?.[0] ?? {}) };
}

export const linkClassCode = defineFunction({
  name: "link_class_code",
  title: "Link a class code to a carrier's appetite",
  description:
    "Record that a carrier writes (or refuses) a class code on a given appetite row — " +
    "the 'who writes it' side, carried on the bridge with eligibility and provenance. " +
    "Set match_method to 'explicit_source' only when the carrier itself stated it; use " +
    "'manual' for your own judgement, so a derived link is never read with the authority " +
    "of a sourced one.",
  input: z.object({
    appetiteId: z.string().describe("carrier_appetite row id — the carrier x line-of-business this applies to."),
    code: z.string(),
    system: systemEnum.optional().describe("Default 'gl'."),
    eligibility: z.enum(["eligible", "conditional", "prohibited"]).optional().describe("Default 'eligible'."),
    matchMethod: z.string().optional().describe("'explicit_source', 'manual', 'keyword', 'embedding'. Default 'manual'."),
    confidence: z.string().optional().describe("Default 'unverified'."),
    stateScope: z.string().nullish().describe("Set when the link only holds in certain states."),
    restrictions: z.string().nullish(),
    sourceNote: z.string().nullish().describe("Where this came from — the guide, the underwriter, the email."),
    updatedBy: z.string().optional(),
  }),
  readOnly: false,
  async handler(input, ctx) {
    const db = requireDb(ctx);
    const appetiteId = String(input.appetiteId ?? "").trim();
    const code = String(input.code ?? "").trim();
    const system = (input.system ?? "gl").toLowerCase();
    if (!appetiteId || !code) throw new FunctionError("appetiteId and code are required");

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
      eligibility: input.eligibility ?? "eligible",
      match_method: input.matchMethod ?? "manual",
      confidence: input.confidence ?? "unverified",
      state_scope: input.stateScope ?? null,
      restrictions: input.restrictions ?? null,
      source_note: input.sourceNote ?? null,
      updated_by: input.updatedBy ?? "carrier-hub",
    }, { onConflict: "appetite_id,code_system,code" });
    if (error) dbFail("class code link", error);

    return { ok: true, resolved: !!(glId || wcId) };
  },
});
