import { createClient } from '@/utils/supabase/client';

// Browser Supabase client. Uses @supabase/ssr so the auth session is stored in
// cookies, which lets the proxy and server components see the signed-in user.
export const supabase = createClient();
