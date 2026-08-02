// Shared text normalization. Every scorer in the app tokenizes the same way, so
// the stop list and the code normalizer live here rather than being re-declared
// next to each matcher.

export const STOP = new Set([
  "the","and","for","with","what","which","who","whom","any","that","this","these",
  "those","from","into","your","our","you","can","will","are","is","a","an","of",
  "to","in","on","or","do","does","have","has","i","we","me","my","write","writes",
  "writing","appetite","business","small","insurance","carrier","carriers","please",
  "need","want","looking","find","about",
]);

export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

// Class codes get typed a dozen ways — "ISO 91341", "91341", "91-341", "sic 8721".
// Compare on the bare alphanumeric code so a stored "91341" still matches a search
// for "ISO 91341", which otherwise silently returned nothing.
export function normalizeClassCode(v: any): string {
  return String(v ?? "")
    .toUpperCase()
    .replace(/\b(ISO|NCCI|SIC|NAICS|CLASS|CODE)\b/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

// The CRM stores state as a full name ("Georgia"); appetite states_approved are
// USPS codes ("GA"). Normalize so matchers compare like for like.
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
  virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI",
  wyoming: "WY",
};

export function toStateAbbr(s: any): string {
  const t = (s ?? "").toString().trim();
  if (!t) return "";
  if (t.length === 2) return t.toUpperCase();
  return US_STATE_ABBR[t.toLowerCase()] || "";
}
