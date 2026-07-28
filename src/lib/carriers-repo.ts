/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Carrier, Contact, AppetiteRecord } from '../types';

/**
 * Loads the full carrier directory (carriers + their contacts) from the app's
 * own `/api/carriers` endpoint, replacing the hardcoded INITIAL_CARRIERS in
 * src/data/carriers.ts. The endpoint runs on the tailnet-only box and reads
 * Supabase with the service role, so there is no per-user login — access is
 * gated by the network (Tailscale). The public Supabase endpoint stays
 * RLS-locked.
 */
export async function fetchCarriers(): Promise<Carrier[]> {
  const res = await fetch('/api/carriers');
  if (!res.ok) {
    const msg = await res.json().catch(() => ({} as { error?: string }));
    throw new Error(msg.error || `Failed to load carriers (${res.status})`);
  }
  const { carriers } = (await res.json()) as { carriers: any[] };
  return (carriers ?? []).map(mapCarrier);
}

function mapCarrier(row: any): Carrier {
  return {
    id: row.id,
    name: row.name,
    isActive: row.is_active ?? true,
    segment: row.segment ?? [],
    linesOfBusiness: row.lines_of_business ?? [],
    agencyCode: row.agency_code ?? undefined,
    generalAgent: row.general_agent ?? undefined,
    website: row.website ?? undefined,
    agentLogin: row.agent_login ?? undefined,
    logoUrl: row.logo_url ?? undefined,
    originalLogoPath: row.original_logo_path ?? undefined,
    appetite: {
      canWrite: row.appetite_can_write ?? [],
      cannotWrite: row.appetite_cannot_write ?? [],
      notes: row.appetite_notes ?? undefined,
      underwritingHotline: row.underwriting_hotline ?? undefined,
    },
    contacts: (row.carrier_contacts ?? [])
      .map(
        (c: any): Contact => ({
          id: c.id,
          name: c.name,
          role: c.role ?? '',
          email: c.email ?? '',
          phone: c.phone ?? '',
          region: c.region ?? undefined,
        }),
      )
      .sort((a: Contact, b: Contact) => a.name.localeCompare(b.name)),
    appetiteRows: (row.carrier_appetite ?? [])
      .map(
        (a: any): AppetiteRecord => ({
          id: a.id,
          lob: a.lob,
          appetiteLevel: a.appetite_level ?? undefined,
          minPremium: a.min_premium ?? null,
          maxPremium: a.max_premium ?? null,
          statesApproved: a.states_approved ?? [],
          keyRequirements: a.key_requirements ?? [],
          exclusions: a.exclusions ?? [],
          classCodes: a.class_codes ?? [],
          notes: a.notes ?? undefined,
          details: a.details ?? {},
          effectiveDate: a.effective_date ?? null,
          active: a.active ?? true,
          source: a.source ?? undefined,
          confidence: a.confidence ?? undefined,
        }),
      )
      .sort((a: AppetiteRecord, b: AppetiteRecord) => a.lob.localeCompare(b.lob)),
    worksheets: row.worksheets ?? undefined,
    incentives: row.incentives ?? undefined,
  };
}

/**
 * Write-through when a carrier is edited/added in the UI, via the box's
 * `/api/carriers` (service role). Contacts ride along in the payload and the
 * server syncs them to `carrier_contacts` (upsert the sent list, delete the rest)
 * so inline contact edits survive a reload.
 */
export async function saveCarrier(c: Carrier): Promise<void> {
  const payload = {
    id: c.id,
    name: c.name,
    is_active: c.isActive,
    segment: c.segment,
    lines_of_business: c.linesOfBusiness,
    agency_code: c.agencyCode ?? null,
    general_agent: c.generalAgent ?? null,
    website: c.website ?? null,
    agent_login: c.agentLogin ?? null,
    logo_url: c.logoUrl ?? null,
    original_logo_path: c.originalLogoPath ?? null,
    appetite_can_write: c.appetite?.canWrite ?? [],
    appetite_cannot_write: c.appetite?.cannotWrite ?? [],
    appetite_notes: c.appetite?.notes ?? null,
    underwriting_hotline: c.appetite?.underwritingHotline ?? null,
    incentives: c.incentives ?? null,
    worksheets: c.worksheets ?? null,
    contacts: (c.contacts ?? []).map((ct) => ({
      id: ct.id,
      name: ct.name,
      role: ct.role ?? null,
      email: ct.email ?? null,
      phone: ct.phone ?? null,
      region: ct.region ?? null,
    })),
    // Structured appetite spine rows ride along the same way contacts do; the
    // server upserts the sent list into carrier_appetite and deletes the rest.
    appetite_rows: (c.appetiteRows ?? []).map((a) => ({
      id: a.id ?? null,
      lob: a.lob,
      appetite_level: a.appetiteLevel ?? null,
      min_premium: a.minPremium ?? null,
      max_premium: a.maxPremium ?? null,
      states_approved: a.statesApproved ?? [],
      key_requirements: a.keyRequirements ?? [],
      exclusions: a.exclusions ?? [],
      class_codes: a.classCodes ?? [],
      notes: a.notes ?? null,
      details: a.details ?? {},
      effective_date: a.effectiveDate ?? null,
      active: a.active ?? true,
      source: a.source ?? 'carrier-hub-ui',
      confidence: a.confidence ?? 'unverified',
    })),
  };
  const res = await fetch('/api/carriers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({} as { error?: string }));
    throw new Error(msg.error || `Failed to save carrier (${res.status})`);
  }
}

/**
 * Delete a carrier and its dependent rows (contacts + appetite) via the box's
 * `/api/carriers/:id` (service role). Used by the drawer's Delete control to
 * remove duplicates/stale carriers — there was previously no delete path.
 */
export async function deleteCarrier(id: string): Promise<void> {
  const res = await fetch(`/api/carriers/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({} as { error?: string }));
    throw new Error(msg.error || `Failed to delete carrier (${res.status})`);
  }
}
