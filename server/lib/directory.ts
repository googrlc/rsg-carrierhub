import type { SupabaseClient } from "../supabase";

// The carrier directory joined with its contacts and its structured appetite
// spine. This shape is what both the UI and every grounded answer read from, so
// the select lives in one place.
export const DIRECTORY_SELECT = "*, carrier_contacts(*), carrier_appetite(*)";

// The full directory was re-read from Supabase on every Ask-the-Desk turn — a round
// trip per message in a conversation, for data that only changes when someone edits a
// carrier. Cache it in-process and bust it on write, so an edit still shows up on the
// very next question rather than after a TTL.
let directoryCache: { at: number; rows: any[] } | null = null;
const DIRECTORY_TTL_MS = 60_000;

export function invalidateDirectoryCache(): void {
  directoryCache = null;
}

export async function loadDirectory(db: SupabaseClient): Promise<any[]> {
  if (directoryCache && Date.now() - directoryCache.at < DIRECTORY_TTL_MS) {
    return directoryCache.rows;
  }
  const { data, error } = await db.from("carriers").select(DIRECTORY_SELECT).order("name");
  if (error) throw new Error(error.message);
  directoryCache = { at: Date.now(), rows: data ?? [] };
  return directoryCache.rows;
}

// Render carrier rows as the grounding block an LLM reads. Every fact an answer
// is allowed to cite has to appear here, which is why appetite rows and the
// underwriter's own class-code guide are flattened in rather than summarized.
export function formatDirectory(carriers: any[]): string {
  return carriers
    .map((c) => {
      const lines = [`Carrier: ${c.name} (id: ${c.id})`];
      if (c.lines_of_business?.length) lines.push(`  LOBs: ${c.lines_of_business.join(", ")}`);
      if (c.general_agent) lines.push(`  General agent: ${c.general_agent}`);
      else lines.push(`  Appointment: direct`);
      if (c.agency_code) lines.push(`  Agency code: ${c.agency_code}`);
      const aw = c.appetite_can_write || [];
      const an = c.appetite_cannot_write || [];
      if (aw.length) lines.push(`  Will write: ${aw.join(" | ")}`);
      if (an.length) lines.push(`  Won't write: ${an.join(" | ")}`);
      if (c.appetite_notes) lines.push(`  Notes: ${c.appetite_notes}`);
      const inc = c.incentives;
      if (inc && typeof inc === "object") {
        if (inc.commissionRate) lines.push(`  Commission summary: ${inc.commissionRate}`);
        if (inc.levelBonus) lines.push(`  Level bonus: ${inc.levelBonus}`);
        if (inc.preferredTier) lines.push(`  Appointment tier: ${inc.preferredTier}`);
        if (inc.paySchedule) lines.push(`  Pay schedule: ${inc.paySchedule}`);
        if (inc.notes) lines.push(`  Incentive notes: ${inc.notes}`);
      }
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
