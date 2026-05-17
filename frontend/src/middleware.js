import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Public paths
  const isPublicPath = path === '/login' || path === '/register';
  
  // Actually we will handle auth in client side since it's a SPA-like dashboard with JWT in localStorage.
  // We can't access localStorage in middleware. We can only access cookies. 
  // If we rely on localStorage, we should just let the client side redirect.
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
