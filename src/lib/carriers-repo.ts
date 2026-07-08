/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Carrier, Contact } from '../types';

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
    worksheets: row.worksheets ?? undefined,
    incentives: row.incentives ?? undefined,
  };
}

/**
 * Write-through when a carrier is edited/added in the UI, via the box's
 * `/api/carriers` (service role). Contact edits are not persisted here yet
 * (the directory's contacts are sourced from the CRM sync).
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
