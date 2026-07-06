import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { fetchTarotMeritDetail } from '@/lib/tarot-merit';

const AUTH_INTERNAL_URL = process.env.AUTH_INTERNAL_URL ?? 'http://127.0.0.1:3101';
const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? 'orasage_token';

/** 已登录用户拉取 tarot 功德详情（服务端转发内网 API） */
export async function GET() {
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const authRes = await fetch(`${AUTH_INTERNAL_URL}/auth/me`, {
    headers: { Cookie: `${JWT_COOKIE_NAME}=${token}` },
    cache: 'no-store',
  });
  if (!authRes.ok) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const data = await authRes.json().catch(() => ({}));
  const userId = Number(data.user?.id);
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ error: '用户无效' }, { status: 400 });
  }

  const merit = await fetchTarotMeritDetail(userId);
  return NextResponse.json(merit);
}
