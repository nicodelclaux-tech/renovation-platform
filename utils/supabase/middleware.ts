import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/types/database';
import { safeRedirectPath } from './redirect';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const AUTH_ROUTES = ['/login', '/signup'];

const isAuthRoute = (pathname: string) =>
  AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

const isApiRoute = (pathname: string) => pathname === '/api' || pathname.startsWith('/api/');

export const updateSession = async (request: NextRequest) => {
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
