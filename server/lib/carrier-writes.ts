import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "../supabase";

// Columns the UI is allowed to write, mirroring the old client-side upsert. We
// pick explicitly so a stray body key can't inject unexpected columns.
export const CARRIER_WRITE_COLUMNS = [
  "id", "name", "is_active", "segment", "lines_of_business", "agency_code",
  "general_agent", "website", "agent_login", "logo_url", "original_logo_path",
  "appetite_can_write", "appetite_cannot_write", "appetite_notes",
  "underwriting_hotline", "incentives", "worksheets",
] as const;

// Sync a carrier's underwriting contacts to `carrier_contacts`. The drawer edits
// contacts inline and sends the full desired list on save, so we treat that list
// as the source of truth: upsert everything the caller sent, then delete any rows
// for this carrier it no longer lists. Without this the carrier row persisted but
// contacts never did — they vanished on the next reload.
export async function syncCarrierContacts(
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

  // Delete rows for this carrier that are no longer in the caller's list.
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
// the caller sent, then delete any rows for this carrier it no longer lists. The
// grain is one row per carrier x line-of-business, so we dedupe on LOB and mint a
// uuid for brand-new rows. Only runs when the caller explicitly sends the list,
// so calls that don't touch appetite never wipe existing rows.
export async function syncCarrierAppetite(
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
