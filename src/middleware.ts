import { NextResponse } from 'next/server';

export function middleware() {
  const response = NextResponse.next();

  // Add CSP headers
  response.headers.set(
    'Content-Security-Policy',
    `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob:;
      font-src 'self';
      connect-src 'self';
    `.replace(/\s+/g, ' ').trim()
  );

  return response;
}

export const config = {
  matcher: '/:path*',
}; 