import type { SupabaseClient } from "../supabase";
import { normalizeClassCode, tokenize } from "./text";

// ---- Class codes: what a code IS (carrier_appetite holds who WRITES it) ----
// The code tables (gl_class_codes 1,154 / wc_class_codes 499) already carry the
// official manual descriptions. What they lack is the search layer — search_keywords
// was populated on zero GL rows — so the reverse lookup is what this module adds.

// A class code normalized across the two manual tables, which use different column
// names (gl_code/wc_code, typical_businesses/typical_duties) for the same idea.
export interface NormalizedCode {
  id: string; system: "gl" | "wc"; code: string; description: string;
  category: string | null; subcategory: string | null;
  searchKeywords: string | null; typicalOf: string | null; notes: string | null;
  residentialOnly: boolean | null; maxStories: number | null; state: string | null;
  score: number; why: string[];
}

// PostgREST caps a single select at its max-rows setting (1,000 by default), and
// gl_class_codes alone is over that. Reading the table in one shot would silently
// return a truncated dictionary — a missing code looks identical to a code we
// don't cover — so every read here pages explicitly until it sees a short page.
const PAGE = 1000;

// Throws on a database error; loadCodeTables converts that to its error result.
async function fetchAllRows(
  db: SupabaseClient, table: string, columns: string, orderBy: string,
): Promise<any[]> {
  const out: any[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db
      .from(table)
      .select(columns)
      .order(orderBy, { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    const page = data ?? [];
    out.push(...page);
    if (page.length < PAGE) return out;
  }
}

// The dictionary is read on every grounded answer and every code lookup, and it
// only changes when someone edits a code. Cache it in-process and bust it on
// write, so a save shows up on the very next lookup rather than after a TTL.
let codeCache: { at: number; codes: NormalizedCode[] } | null = null;
const CODE_TTL_MS = 5 * 60_000;

export function invalidateClassCodeCache(): void {
  codeCache = null;
}

export async function loadCodeTables(
  db: SupabaseClient, system: string,
): Promise<{ codes: NormalizedCode[] } | { error: string }> {
  // Always hand back a fresh array — callers sort and slice the result, and the
  // cached list must not move under them.
  const filter = (all: NormalizedCode[]) =>
    system === "gl" || system === "wc" ? all.filter((c) => c.system === system) : all.slice();

  if (codeCache && Date.now() - codeCache.at < CODE_TTL_MS) {
    return { codes: filter(codeCache.codes) };
  }

  let glRows: any[];
  let wcRows: any[];
  try {
    // Both systems are always loaded so one cache serves every filter.
    [glRows, wcRows] = await Promise.all([
      fetchAllRows(db, "gl_class_codes", "id,gl_code,description,category,subcategory,search_keywords,typical_businesses,notes,residential_only,max_stories", "gl_code"),
      fetchAllRows(db, "wc_class_codes", "id,wc_code,description,category,subcategory,search_keywords,typical_duties,notes,state", "wc_code"),
    ]);
  } catch (e: any) {
    return { error: e?.message || "code lookup failed" };
  }

  const codes: NormalizedCode[] = [
    ...glRows.map((r: any) => ({
      id: r.id, system: "gl" as const, code: r.gl_code, description: r.description ?? "",
      category: r.category ?? null, subcategory: r.subcategory ?? null,
      searchKeywords: r.search_keywords ?? null, typicalOf: r.typical_businesses ?? null,
      notes: r.notes ?? null, residentialOnly: r.residential_only ?? null,
      maxStories: r.max_stories ?? null, state: null, score: 0, why: [],
    })),
    ...wcRows.map((r: any) => ({
      id: r.id, system: "wc" as const, code: r.wc_code, description: r.description ?? "",
      category: r.category ?? null, subcategory: r.subcategory ?? null,
      searchKeywords: r.search_keywords ?? null, typicalOf: r.typical_duties ?? null,
      notes: r.notes ?? null, residentialOnly: null, maxStories: null,
      state: r.state ?? null, score: 0, why: [],
    })),
  ];
  codeCache = { at: Date.now(), codes };
  return { codes: filter(codes) };
}

// Reverse lookup: a business description in, ranked candidate class codes out.
// This is the query that actually saves a rewritten submission — the producer knows
// what the business DOES, not what it classifies as. An exact code match short-
// circuits to the top; otherwise it's token overlap weighted by where the token hit.
export function rankClassCodes(rows: NormalizedCode[], query: string): NormalizedCode[] {
  const wantedCode = normalizeClassCode(query);
  const terms = tokenize(query);

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

// Render ranked codes for an LLM prompt.
export function formatCodeDictionary(hits: NormalizedCode[]): string {
  if (!hits.length) return "none matched";
  return hits
    .map((c) => {
      const bits = [`${c.system.toUpperCase()} ${c.code} — ${c.description}`];
      if (c.category || c.subcategory) bits.push(`  category: ${[c.category, c.subcategory].filter(Boolean).join(" / ")}`);
      if (c.typicalOf) bits.push(`  typical: ${c.typicalOf}`);
      if (c.notes) bits.push(`  notes: ${c.notes}`);
      if (c.maxStories) bits.push(`  max stories: ${c.maxStories}`);
      if (c.state) bits.push(`  state: ${c.state}`);
      return bits.join("\n");
    })
    .join("\n");
}
