import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple rate limiting with in-memory store
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // max requests per window

export function middleware(request: NextRequest) {
  // Security headers are handled by next.config.js
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    const now = Date.now();
    const record = rateLimit.get(ip);

    if (!record || now > record.resetTime) {
      rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    } else {
      record.count++;
      if (record.count > RATE_LIMIT_MAX) {
        return NextResponse.json(
          { error: '请求过于频繁，请稍后重试' },
          { status: 429, headers: { 'Retry-After': '60' } }
        );
      }
    }
  }
}

export const config = {
  matcher: '/api/:path*',
};
