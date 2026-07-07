/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from './supabase';
import type { Carrier, Contact } from '../types';

/**
 * Loads the full carrier directory (carriers + their contacts) from Supabase,
 * replacing the hardcoded INITIAL_CARRIERS in src/data/carriers.ts. The
 * `carriers` / `carrier_contacts` tables are RLS-gated on is_commission_user(),
 * so the user must be signed in and allowlisted (enforced by <AuthGate>).
 */
export async function fetchCarriers(): Promise<Carrier[]> {
  const { data, error } = await supabase
    .from('carriers')
    .select('*, carrier_contacts(*)')
    .order('name');
  if (error) throw error;
  return (data ?? []).map(mapCarrier);
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
 * Best-effort write-through when a carrier is edited/added in the UI. RLS lets
 * admins (is_commission_admin) write; non-admins get a permission error, which
 * callers swallow so in-session edits still work locally. Contact edits are not
 * persisted here yet (the directory's contacts are sourced from the CRM sync).
 */
export async function saveCarrier(c: Carrier): Promise<void> {
  const { error } = await supabase.from('carriers').upsert({
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
  });
  if (error) throw error;
}
