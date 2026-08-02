import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";

// Server-side Supabase client using the SERVICE ROLE key. This lives ONLY on the
// tailnet-only box and never reaches the browser. It lets the app read/write the
// carrier directory without any per-user login: access is gated by the network
// (Tailscale), and the public Supabase REST endpoint stays fully RLS-locked
// (money/commission tables untouched). See RUNBOOK.md.
let cached: SupabaseClient | null | undefined;

export function resolveSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const { url, serviceRoleKey } = supabaseConfig;
  cached = url && serviceRoleKey
    ? createClient(url, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;
  return cached;
}

export type { SupabaseClient };
