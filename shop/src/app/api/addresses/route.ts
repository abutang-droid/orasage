import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { proxyAuthMe } from '@/lib/auth-proxy';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 });
  const res = await proxyAuthMe('/addresses');
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 });
  const body = await req.text();
  const res = await proxyAuthMe('/addresses', { method: 'POST', body });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
