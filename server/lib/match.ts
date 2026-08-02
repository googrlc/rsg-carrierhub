import { normalizeClassCode, tokenize } from "./text";

// Deterministic appetite matcher — the connection point a CRM Opportunity hits.
// Given a risk (lob / state / class code / premium / keywords) it scores every
// carrier_appetite row and returns ranked carrier+program fits with the reasons
// it fit and cautions to verify (state gaps, premium band, exclusion hits). This
// is the structured counterpart to the LLM advisors: same data, but repeatable.
export interface MatchQuery {
  lob?: string; state?: string; classCode?: string;
  premium?: number | null; keywords?: string;
}

export interface AppetiteMatch {
  carrierId: string;
  carrier: string;
  program: string;
  generalAgent: string | null;
  appetiteLevel: string | null;
  minPremium: number | null;
  maxPremium: number | null;
  score: number;
  reasons: string[];
  cautions: string[];
}

export function matchAppetite(rows: any[], q: MatchQuery): AppetiteMatch[] {
  const terms = tokenize(q.keywords || "");
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
