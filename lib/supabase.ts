import { createClient } from '@/utils/supabase/client';

type BrowserClient = ReturnType<typeof createClient>;

let client: BrowserClient | undefined;

function getClient(): BrowserClient {
  return (client ??= createClient());
}

// Browser Supabase client. Uses @supabase/ssr so the auth session is stored in
// cookies, which lets the proxy and server components see the signed-in user.
// Created lazily on first use so prerendering client pages (e.g. /login) at
// build time doesn't require the Supabase env vars.
export const supabase = new Proxy({} as BrowserClient, {
  get(_target, prop) {
    const c = getClient();
    const value = Reflect.get(c, prop, c);
    return typeof value === 'function' ? value.bind(c) : value;
  },
});
