import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/aprendizado', '/curso'];

function isLessonRoute(pathname: string) {
  return /^\/curso\/[^/]+\/aula/.test(pathname);
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token');
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith('/aprendizado') || isLessonRoute(pathname);

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/aprendizado/:path*', '/curso/:path*/aula/:path*'],
};
