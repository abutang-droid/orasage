import { NextRequest, NextResponse } from 'next/server';
import { authCookieHeader } from '@/lib/auth-user-server';

const AUTH_INTERNAL = process.env.AUTH_INTERNAL_URL || 'http://127.0.0.1:3101';

export async function GET(req: NextRequest) {
  const readingId = req.nextUrl.searchParams.get('readingId')?.trim();
  if (!readingId) {
    return NextResponse.json({ error: '缺少 readingId' }, { status: 400 });
  }
  const cookie = await authCookieHeader();
  const res = await fetch(
    `${AUTH_INTERNAL}/api/ziwei/chat/quota?readingId=${encodeURIComponent(readingId)}`,
    { headers: { cookie }, cache: 'no-store' },
  );
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
