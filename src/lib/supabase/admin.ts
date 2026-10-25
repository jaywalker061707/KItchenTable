import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only client using the Supabase service role key. This bypasses
 * Row Level Security entirely, so it must never be imported into any file
 * that can run in the browser (no "use client" components). Household
 * scoping is enforced in application code (see src/lib/auth), not by
 * Postgres policies, for every query made with this client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.",
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
