import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/types/database';
import { safeRedirectPath } from './redirect';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const NOT_CONFIGURED_MESSAGE =
  'Supabase is not configured for this deployment. Set NEXT_PUBLIC_SUPABASE_URL and ' +
  'NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) for this environment and redeploy.';

// Without the env vars every request would crash with a bare 500; explain instead.
const notConfiguredResponse = (pathname: string) =>
  isApiRoute(pathname)
    ? NextResponse.json({ error: NOT_CONFIGURED_MESSAGE }, { status: 503 })
    : new NextResponse(
        `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">` +
          `<title>Not configured</title><body style="font-family:system-ui,sans-serif;max-width:560px;margin:15vh auto;padding:0 16px;color:#37352f">` +
          `<h1 style="font-size:20px">App not configured</h1><p style="line-height:1.5">${NOT_CONFIGURED_MESSAGE}</p></body>`,
        { status: 503, headers: { 'content-type': 'text/html; charset=utf-8' } }
      );

const AUTH_ROUTES = ['/login', '/signup'];

const isAuthRoute = (pathname: string) =>
  AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

const isApiRoute = (pathname: string) => pathname === '/api' || pathname.startsWith('/api/');

export const updateSession = async (request: NextRequest) => {
  if (!supabaseUrl || !supabaseKey) {
    console.error(NOT_CONFIGURED_MESSAGE);
    return notConfiguredResponse(request.nextUrl.pathname);
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Do not run code between createServerClient and getUser(): it refreshes the session.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  // API routes handle their own auth and return 401s.
  if (isApiRoute(pathname)) return response;

  const redirectTo = (url: URL) => {
    const redirect = NextResponse.redirect(url);
    // Carry over any refreshed auth cookies.
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  if (!user && !isAuthRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    if (pathname !== '/') url.searchParams.set('next', `${pathname}${search}`);
    return redirectTo(url);
  }

  if (user && isAuthRoute(pathname)) {
    const next = safeRedirectPath(request.nextUrl.searchParams.get('next'));
    return redirectTo(new URL(next, request.url));
  }

  return response;
};
