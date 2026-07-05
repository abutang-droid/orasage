import { NextRequest, NextResponse } from 'next/server';
import { authCookieHeader } from '@/lib/auth-user-server';

const AUTH_INTERNAL = process.env.AUTH_INTERNAL_URL || 'http://127.0.0.1:3101';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const cookie = await authCookieHeader();
  const res = await fetch(`${AUTH_INTERNAL}/api/ziwei/chat/consume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
