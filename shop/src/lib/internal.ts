import type { NextRequest } from 'next/server';

export function isLocalRequest(req: NextRequest | Request) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const ip = forwarded.split(',')[0]?.trim();
    return ip === '127.0.0.1' || ip === '::1';
  }
  return true;
}
