#!/usr/bin/env tsx
/**
 * Upsert GA AMGDA life carriers (with pay schedules) into Supabase.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-amgda-life-carriers.ts
 *
 * Reads credentials from .env.local when present (dotenv).
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { AMGDA_LIFE_CARRIERS } from '../src/data/amgda-life-carriers';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const db = createClient(url, key);

function toRow(c: (typeof AMGDA_LIFE_CARRIERS)[number]) {
  return {
    id: c.id,
    name: c.name,
    is_active: c.isActive,
    segment: c.segment,
    lines_of_business: c.linesOfBusiness,
    agency_code: c.agencyCode ?? null,
    general_agent: c.generalAgent ?? null,
    website: c.website ?? null,
    agent_login: c.agentLogin ?? null,
    appetite_can_write: c.appetite.canWrite,
    appetite_cannot_write: c.appetite.cannotWrite,
    appetite_notes: c.appetite.notes ?? null,
    incentives: c.incentives ?? null,
  };
}

async function main() {
  const rows = AMGDA_LIFE_CARRIERS.map(toRow);
  console.log(`Upserting ${rows.length} GA AMGDA life carriers...`);

  const { error } = await db.from('carriers').upsert(rows, { onConflict: 'id' });
  if (error) {
    console.error('Upsert failed:', error.message);
    process.exit(1);
  }

  console.log('Done. Carriers upserted with pay schedules in incentives.notes.');
  for (const c of AMGDA_LIFE_CARRIERS) {
    console.log(`  • ${c.name} (${c.id}) → ${c.generalAgent}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
