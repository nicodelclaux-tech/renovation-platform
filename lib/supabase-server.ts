import { createClient } from '@supabase/supabase-js';
import { Database } from './types/database';

// Server-side Supabase clients that do NOT read the request's auth cookies.
//
// For anything acting on behalf of the signed-in user (pages, layouts, route
// handlers, server actions) use the cookie-based client instead:
//   import { createClient } from '@/utils/supabase/server';
//   const supabase = await createClient();

if (typeof window !== 'undefined') {
  throw new Error('lib/supabase-server.ts must only be imported on the server.');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Admin client using SUPABASE_SERVICE_ROLE_KEY. BYPASSES ROW LEVEL SECURITY.
 * Server-only. Use solely for trusted back-office work after you have verified
 * the caller's identity and ownership yourself. Never pass its results to a
 * user without an explicit authorization check.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set.');
  }
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * @deprecated Use `createClient` from '@/utils/supabase/server' (cookie-based,
 * RLS-scoped to the signed-in user). This anonymous client has no user session,
 * so RLS-protected tables return no rows. It never uses the service role key.
 */
export function createServerClient() {
  return createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
