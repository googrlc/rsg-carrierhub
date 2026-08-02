import { z } from "zod";
import { defineFunction, requireDb, FunctionError } from "./types";
import { KEY_MISSING_HINT } from "../config";
import { completeChat, resolveLLM, type ChatMessage } from "../llm";
import { DIRECTORY_SELECT, formatDirectory, loadDirectory } from "../lib/directory";
import { loadClassGuides, searchClassGuides, formatClassRows } from "../lib/guides";
import { formatCodeDictionary, loadCodeTables, rankClassCodes } from "../lib/class-codes";

// The three grounded-answer functions. All of them read the app's own directory
// and class-code data and are told to answer from it alone — the value here is
// the grounding, not the model.

const historySchema = z
  .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
  .optional()
  .describe("Prior turns, oldest first, so follow-ups keep their context.");

function unavailable(what: string) {
  return { text: `⚠️ **${what} unavailable**: ${KEY_MISSING_HINT}.`, sources: [] as unknown[] };
}

export const carrierAdvisor = defineFunction({
  name: "carrier_advisor",
  title: "Ask about one carrier's appetite",
  description:
    "Judge whether a specific risk fits one named carrier's appetite. Answers from that " +
    "carrier's own record — appetite rows, class codes, states, premium bands, " +
    "requirements, exclusions, contacts — and returns a verdict (within appetite / refer " +
    "to underwriting / prohibited), why, and what to gather for the submission. For 'which " +
    "of our carriers writes this?' use panel_advisor or match_appetite instead.",
  input: z.object({
    carrierId: z.string().optional().describe("Carrier id. Supply it — without it the answer is ungrounded."),
    carrierName: z.string().optional(),
    inquiry: z.string().describe("The risk or question."),
    history: historySchema,
  }),
  readOnly: true,
  async handler(input, ctx) {
    const inquiry = String(input.inquiry ?? "").trim();
    if (!inquiry) throw new FunctionError("Missing inquiry");

    const llm = resolveLLM("advisor");
    if (!llm) {
      return {
        text: `⚠️ **AI Advisor Unavailable**: The appetite advisor could not run because ${KEY_MISSING_HINT}. \n\n*Context of Carrier analyzed:* **${input.carrierName || "General Carrier"}**`,
      };
    }

    // Ground on the LIVE spine. The drawer only ever passed canWrite/cannotWrite/
    // notes, so the assistant could not see class codes, states, premium bands or
    // contacts — exactly what carrier questions ask about.
    let carrierContext =
      "General multi-carrier guidelines context. Search for matching appetites among commercial, personal, MGA, GA insurance operations.";
    if (ctx.db && input.carrierId) {
      const { data: row } = await ctx.db
        .from("carriers")
        .select(DIRECTORY_SELECT)
        .eq("id", String(input.carrierId))
        .maybeSingle();
      if (row) carrierContext = formatDirectory([row]);
    }

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

    const messages: ChatMessage[] = [{ role: "system", content: systemInstruction }];
    for (const m of input.history ?? []) {
      messages.push({ role: m.role, content: String(m.content ?? "") });
    }
    messages.push({ role: "user", content: inquiry });

    // Low temperature for factual underwriting evaluation.
    const text = await completeChat(llm, messages, { task: "advisor", temperature: 0.2 });
    return { text };
  },
});

export const panelAdvisor = defineFunction({
  name: "panel_advisor",
  title: "Ask which carriers on the panel fit a risk",
  description:
    "Reads the whole appointed panel and recommends the 1-3 carriers that fit a risk, " +
    "flags any that would auto-decline it, and names what to collect for the submission. " +
    "Recommends only carriers actually on the panel. Use match_appetite when you want a " +
    "deterministic, repeatable ranking instead of a written recommendation.",
  input: z.object({
    inquiry: z.string().describe("The risk to place."),
    carriersList: z.array(z.any()).optional()
      .describe("Legacy fallback panel, used only when the carrier store is unreachable."),
  }),
  readOnly: true,
  async handler(input, ctx) {
    const inquiry = String(input.inquiry ?? "").trim();
    if (!inquiry) throw new FunctionError("Missing inquiry");

    const llm = resolveLLM("advisor");
    if (!llm) {
      return { text: `⚠️ **AI Advisor Unavailable**: The panel advisor could not run because ${KEY_MISSING_HINT}.` };
    }

    let panel = "";
    if (ctx.db) {
      const rows = await loadDirectory(ctx.db);
      if (rows.length) panel = formatDirectory(rows);
    }
    // Only if the live panel is unavailable do we fall back to whatever the caller
    // sent — that blob drops every structured fact, so it is a last resort.
    if (!panel) {
      panel = Array.isArray(input.carriersList) && input.carriersList.length
        ? input.carriersList.map((c: any) => `Carrier: ${c.name}
Segment: ${(c.segment || []).join(", ")}
LOBs: ${(c.linesOfBusiness || []).join(", ")}
✅ Will Write: ${(c.appetite?.canWrite || []).join("; ")}
❌ Won't Write: ${(c.appetite?.cannotWrite || []).join("; ")}`).join("\n---\n")
        : "Standard commercial independent agency carriers panel.";
    }

    const systemInstruction = `You are a helpful, senior Independent Agency Underwriting Consultant.
You help commercial and personal insurance agents identify which carrier(s) from their active panel would be the perfect fit for a certain client risk.

Active Carrier Panel available to check:
${panel}

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

    const text = await completeChat(
      llm,
      [
        { role: "system", content: systemInstruction },
        { role: "user", content: inquiry },
      ],
      { task: "advisor", temperature: 0.3 },
    );
    return { text };
  },
});

export const askCarrierDesk = defineFunction({
  name: "ask_carrier_desk",
  title: "Ask the Carrier Desk",
  description:
    "Grounded conversational Q&A over everything the hub knows: the live carrier " +
    "directory with contacts and appetite, the GL/WC class-code dictionary, the carrier " +
    "profile guides, and the carrier↔code bridge. This is the general-purpose door — " +
    "placement questions, classification questions, 'who do I call at X'. It holds a " +
    "conversation, so pass prior turns in `history` and follow-ups will resolve against " +
    "them. Returns the answer plus the class-code rows it drew on in `sources`.",
  input: z.object({
    inquiry: z.string().describe("The question."),
    history: historySchema,
  }),
  readOnly: true,
  async handler(input, ctx) {
    const inquiry = String(input.inquiry ?? "").trim();
    const history = input.history ?? [];
    if (!inquiry) throw new FunctionError("Missing inquiry");

    const llm = resolveLLM("desk");
    if (!llm) return unavailable("Ask the Hub");

    const db = requireDb(ctx);

    // 1) Live carrier directory (cached in-process, busted on any carrier write —
    // so it still reflects an edit on the next question).
    const carriers = await loadDirectory(db);

    // 2) Selective class-code retrieval (only rows relevant to the question).
    const matched = searchClassGuides(loadClassGuides(), inquiry);

    // 2b) The manual class-code tables — what a code IS, independent of who writes
    // it. Only the codes relevant to this question, so the prompt stays small
    // against 1,650+ rows.
    const loadedCodes = await loadCodeTables(db, "");
    const dictHits = "codes" in loadedCodes ? rankClassCodes(loadedCodes.codes, inquiry).slice(0, 8) : [];

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

Each turn also carries a CLASS-CODE CONTEXT block with the codes relevant to that
question. Codes and carrier links there are two different facts: a code tells you how an
operation classifies; a link tells you which carrier will write it and whether it's
eligible, conditional, or prohibited. Never infer one from the other. "explicit_source"
means the carrier stated it; "keyword"/"embedding" means we derived it — flag derived
links as needing confirmation. Anything absent is not on file: say so rather than
reciting a class code from memory.

=== LIVE CARRIER DIRECTORY (with appetite + contacts) ===
${formatDirectory(carriers)}`;

    // Prior turns ride along so the hub holds a conversation about a carrier
    // rather than answering each question cold.
    const messages: ChatMessage[] = [{ role: "system", content: systemInstruction }];
    for (const m of history.slice(-12)) {
      messages.push({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content ?? "") });
    }

    // Per-question class-code context rides in the USER turn, not the system
    // prompt. The system prompt is then byte-identical across every question and
    // every user, which is what lets the directory prefix — by far the largest
    // part of the request — actually hit the cache instead of being re-billed at
    // full rate on each turn.
    messages.push({
      role: "user",
      content:
        `=== CLASS-CODE CONTEXT FOR THIS QUESTION ===\n` +
        `Carrier profile guides: ${formatClassRows(matched)}\n\n` +
        `Manual class codes: ${formatCodeDictionary(dictHits)}\n\n` +
        `Carrier ↔ code links: ${bridgeCtx}\n\n` +
        `=== QUESTION ===\n${inquiry}`,
    });

    const text = await completeChat(llm, messages, { task: "desk", temperature: 0.2 });

    return {
      text,
      sources: matched.map((m) => ({
        carrier: m.carrierName,
        sic: m.sic,
        classCode: m.cna_connect_class_code,
        classDescription: m.class_description,
      })),
    };
  },
});
