import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;


  const isPublicPath = path === '/login' || path === '/register';


  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
