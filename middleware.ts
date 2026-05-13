import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  // Public routes that don't need auth
  const publicPaths = ['/login', '/signup', '/api'];
  const isPublic = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));
  
  if (isPublic) return NextResponse.next();

  // For now, allow all access (auth check will be cookie-based later)
  // This is a placeholder - full auth middleware requires @supabase/ssr
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
