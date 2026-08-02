import { z } from "zod";
import { defineFunction, requireDb, dbFail, FunctionError } from "./types";
import { matchAppetite, type MatchQuery } from "../lib/match";
import { toStateAbbr } from "../lib/text";

// The appetite spine joined to its carrier. Both matchers score the same rows.
const APPETITE_SELECT = "*, carriers(id,name,is_active,general_agent)";

export const listAppointments = defineFunction({
  name: "appointments_by_line",
  title: "Appointments by line of business",
  description:
    "The panel inverted: for each line of business, which carriers the agency can place " +
    "it with and whether the appointment is direct or through a general agent. 'Who can " +
    "write this?' is usually a question about the appointment list rather than about one " +
    "carrier. An appetite row counts as evidence of an appointment even when the " +
    "carrier's lines_of_business field was never filled in.",
  input: z.object({
    lob: z.string().optional()
      .describe("Filter to lines whose name contains this, e.g. 'work comp'. Omit for all lines."),
  }),
  readOnly: true,
  async handler(input, ctx) {
    const db = requireDb(ctx);
    const want = (input.lob ?? "").toString().trim().toLowerCase();

    const [{ data: carriers, error: cErr }, { data: appetite, error: aErr }] = await Promise.all([
      db.from("carriers").select("id,name,general_agent,lines_of_business,is_active").eq("is_active", true).order("name"),
      db.from("carrier_appetite").select("carrier_id,lob,appetite_level,class_codes").eq("active", true),
    ]);
    if (cErr || aErr) dbFail("appointment lookup", cErr || aErr);

    const byLine = new Map<string, any[]>();
    for (const c of carriers ?? []) {
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
    return { lineCount: lines.length, lines };
  },
});

export const matchAppetiteFn = defineFunction({
  name: "match_appetite",
  title: "Find markets for a risk",
  description:
    "Deterministic market finder. Give it what you know about a risk — line of business, " +
    "state, class code, target premium, keywords — and it scores every appetite row and " +
    "returns ranked carrier + program fits, each with the reasons it fit and cautions to " +
    "verify (state not approved, premium outside the band, a keyword that appears in the " +
    "program's exclusions). No LLM, so the same risk always returns the same ranking. " +
    "Prefer this over ask_carrier_desk when you want a repeatable placement list.",
  input: z.object({
    lob: z.string().optional().describe("Line of business, e.g. 'General Liability'."),
    state: z.string().optional().describe("Full name or USPS code — 'Georgia' and 'GA' both work."),
    classCode: z.string().optional().describe("GL, WC or SIC code in any format."),
    premium: z.number().nullish().describe("Target annual premium in dollars."),
    keywords: z.string().optional().describe("Free text about the operation."),
    limit: z.number().int().min(1).max(50).optional().describe("Default 10."),
  }),
  readOnly: true,
  async handler(input, ctx) {
    const db = requireDb(ctx);
    const q: MatchQuery = {
      lob: input.lob, state: input.state, classCode: input.classCode,
      premium: input.premium, keywords: input.keywords,
    };
    if (!q.lob && !q.state && !q.classCode && (q.premium == null || (q.premium as any) === "") && !q.keywords) {
      throw new FunctionError("Provide at least one of: lob, state, classCode, premium, keywords");
    }

    const { data, error } = await db.from("carrier_appetite").select(APPETITE_SELECT).eq("active", true);
    if (error) dbFail("appetite read", error);

    const limit = Math.min(input.limit ?? 10, 50);
    const normState = toStateAbbr(q.state);
    if (normState) q.state = normState; // accept "Georgia" or "GA"
    const matches = matchAppetite(data ?? [], q).slice(0, limit);
    return {
      query: {
        lob: q.lob ?? null, state: q.state ?? null, classCode: q.classCode ?? null,
        premium: q.premium ?? null, keywords: q.keywords ?? null,
      },
      count: matches.length,
      matches,
    };
  },
});

export const matchOpportunity = defineFunction({
  name: "match_opportunity_appetite",
  title: "Find markets for a CRM opportunity",
  description:
    "Same market finder, but it builds the risk itself from a CRM opportunity: reads the " +
    "opportunity, enriches state and SIC from the canonical client, then ranks markets. " +
    "Read-only by default. Pass commit true to write the winning carrier back onto " +
    "opportunities.carrier — that only happens when the top match actually scores " +
    "positive, never on a weak guess.",
  input: z.object({
    opportunityId: z.string(),
    commit: z.boolean().optional()
      .describe("Write the top match back to opportunities.carrier. Default false."),
    limit: z.number().int().min(1).max(50).optional().describe("Default 10."),
  }),
  readOnly: false,
  async handler(input, ctx) {
    const db = requireDb(ctx);
    const opportunityId = String(input.opportunityId ?? "").trim();
    const commit = input.commit === true;
    const limit = Math.min(input.limit ?? 10, 50);
    if (!opportunityId) throw new FunctionError("opportunityId is required");

    // 1) Load the opportunity
    const { data: opp, error: oppErr } = await db
      .from("opportunities")
      .select("id, insured_id, insured_name, line_of_business, premium_estimate, carrier, stage, status")
      .eq("id", opportunityId)
      .maybeSingle();
    if (oppErr) dbFail("opportunity read", oppErr);
    if (!opp) throw new FunctionError("opportunity not found", 404);

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
    const { data: rows, error } = await db.from("carrier_appetite").select(APPETITE_SELECT).eq("active", true);
    if (error) dbFail("appetite read", error);
    const matches = matchAppetite(rows ?? [], risk).slice(0, limit);

    // 4) Optional write-back — only a positive top fit, never a weak guess
    let committed: { carrier: string } | null = null;
    if (commit && matches.length && matches[0].score > 0) {
      const top = matches[0];
      const label = top.program ? `${top.carrier} — ${top.program}` : top.carrier;
      const { error: upErr } = await db.from("opportunities").update({ carrier: label }).eq("id", opportunityId);
      if (upErr) dbFail("opportunity write-back", upErr);
      committed = { carrier: label };
    }

    return {
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
    };
  },
});
