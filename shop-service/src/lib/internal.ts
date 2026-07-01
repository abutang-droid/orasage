import type { NextRequest } from 'next/server';

const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

export function isInternalRequest(req: NextRequest): boolean {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first && !LOOPBACK.has(first)) return false;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp && !LOOPBACK.has(realIp)) return false;

  const host = req.headers.get('host') ?? '';
  if (host.includes('127.0.0.1') || host.includes('localhost')) return true;

  return process.env.NODE_ENV !== 'production';
}

export function internalOnlyResponse(): Response {
  return Response.json({ error: 'internal endpoint only' }, { status: 403 });
}
