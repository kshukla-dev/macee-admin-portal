import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE_NAME = 'macee_admin_session';
const AUTH_TOKEN = 'macee_authenticated_session_token_xyz';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass static files, internal Next.js assets, and public uploads
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. When opening new / root URL, always redirect to /login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Login page is public
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // 4. Protected Dashboard routes: check auth session cookie
  if (pathname.startsWith('/dashboard')) {
    const sessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (sessionToken !== AUTH_TOKEN) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // 5. Any wrong, unrecognized, or invalid route: redirect to /login
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static, _next/image
     * - favicon.ico, images, uploads
     */
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};
