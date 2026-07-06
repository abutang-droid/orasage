import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { proxyAuthMe } from '@/lib/auth-proxy';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, context: RouteContext) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 });
  const { id } = await context.params;
  const body = await req.text();
  const res = await proxyAuthMe(`/addresses/${encodeURIComponent(id)}`, { method: 'PUT', body });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 });
  const { id } = await context.params;
  const res = await proxyAuthMe(`/addresses/${encodeURIComponent(id)}`, { method: 'DELETE' });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
