/**
 * Upsert AMG/IDA (AMGDA) life carriers + commission pay schedules into Supabase.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx ops/seed-amg-ida-carriers.ts
 *
 * Or with .env.local loaded:
 *   npx tsx ops/seed-amg-ida-carriers.ts
 *
 * For carriers that already exist, only general_agent + incentives (+ light LOB
 * refresh) are patched so contacts/appetite are preserved. New carriers are
 * inserted with a full starter record.
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import {
  AMG_IDA_CARRIERS,
  AMG_IDA_GA,
  AMG_IDA_PAY_SCHEDULE_CARRIERS,
  toAmgIdaCarrier,
} from '../src/data/amg-ida-carriers.ts';

config({ path: '.env.local' });
config(); // .env fallback

const url =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.DATABASE_URL ||
  '';
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  '';

if (!url || !key) {
  console.error(
    'Missing SUPABASE_URL (or VITE_SUPABASE_URL/DATABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.',
  );
  process.exit(1);
}

if (!url.startsWith('http')) {
  console.error(`SUPABASE_URL must be an https project URL, got: ${url.slice(0, 32)}…`);
  process.exit(1);
}

const dryRun = process.argv.includes('--dry-run');

const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log(`Seeding ${AMG_IDA_PAY_SCHEDULE_CARRIERS.length} carriers → GA ${AMG_IDA_GA}`);
  console.log(`Supabase: ${url}${dryRun ? ' (dry-run)' : ''}`);

  if (dryRun) {
    for (const row of AMG_IDA_PAY_SCHEDULE_CARRIERS) {
      console.log(`· ${row.id} — ${row.name} — ${row.summary}`);
    }
    console.log(`\nDry run only. Re-run without --dry-run to write.`);
    return;
  }

  const ids = AMG_IDA_PAY_SCHEDULE_CARRIERS.map((c) => c.id);
  const { data: existing, error: readErr } = await db
    .from('carriers')
    .select('id,name,general_agent,incentives,lines_of_business')
    .in('id', ids);

  if (readErr) {
    console.error('Failed to read existing carriers:', readErr.message);
    process.exit(1);
  }

  const existingById = new Map((existing ?? []).map((r) => [r.id, r]));
  let updated = 0;
  let inserted = 0;
  let failed = 0;

  for (const row of AMG_IDA_PAY_SCHEDULE_CARRIERS) {
    const carrier = toAmgIdaCarrier(row);
    const prior = existingById.get(row.id);

    if (prior) {
      const patch = {
        general_agent: AMG_IDA_GA,
        incentives: carrier.incentives,
        lines_of_business: carrier.linesOfBusiness,
        is_active: true,
      };
      const { error } = await db.from('carriers').update(patch).eq('id', row.id);
      if (error) {
        failed += 1;
        console.error(`UPDATE fail ${row.id}: ${error.message}`);
      } else {
        updated += 1;
        console.log(`✓ updated ${row.id} (${row.name})`);
      }
      continue;
    }

    const insert = {
      id: carrier.id,
      name: carrier.name,
      is_active: true,
      segment: carrier.segment,
      lines_of_business: carrier.linesOfBusiness,
      agency_code: carrier.agencyCode ?? null,
      general_agent: AMG_IDA_GA,
      appetite_can_write: carrier.appetite.canWrite,
      appetite_cannot_write: carrier.appetite.cannotWrite,
      appetite_notes: carrier.appetite.notes ?? null,
      incentives: carrier.incentives,
    };
    const { error } = await db.from('carriers').insert(insert);
    if (error) {
      failed += 1;
      console.error(`INSERT fail ${row.id}: ${error.message}`);
    } else {
      inserted += 1;
      console.log(`+ inserted ${row.id} (${row.name})`);
    }
  }

  // Also code near-duplicate Banner / Symetra rows if present.
  const aliasPatches: { id: string; fromId: string }[] = [
    { id: 'banner-life-legal-general', fromId: 'banner-life-legal-general-america' },
    { id: 'symetra', fromId: 'symetra-life' },
  ];
  for (const alias of aliasPatches) {
    const source = AMG_IDA_CARRIERS.find((c) => c.id === alias.fromId);
    if (!source) continue;
    const { data, error: findErr } = await db
      .from('carriers')
      .select('id')
      .eq('id', alias.id)
      .maybeSingle();
    if (findErr || !data) continue;
    const { error } = await db
      .from('carriers')
      .update({
        general_agent: AMG_IDA_GA,
        incentives: source.incentives,
        is_active: true,
      })
      .eq('id', alias.id);
    if (error) {
      console.error(`ALIAS fail ${alias.id}: ${error.message}`);
      failed += 1;
    } else {
      updated += 1;
      console.log(`✓ alias updated ${alias.id}`);
    }
  }

  // Refresh AMG/IDA GA row notes so the desk knows the panel lives under it.
  const { error: gaErr } = await db
    .from('carriers')
    .update({
      lines_of_business: [
        'Life Brokerage GA (AMGDA) — Term/IUL/LTC/Annuity panel with commission pay schedules',
      ],
      appetite_notes:
        'GA AMGDA (AMG/IDA). Downstream life/annuity carriers are appointed via this GA; see each carrier incentives.paySchedule.',
    })
    .eq('id', 'amg-ida');
  if (gaErr) {
    console.warn(`AMG/IDA GA row note refresh skipped: ${gaErr.message}`);
  } else {
    console.log('✓ refreshed amg-ida GA row');
  }

  console.log(`\nDone. updated=${updated} inserted=${inserted} failed=${failed}`);
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
