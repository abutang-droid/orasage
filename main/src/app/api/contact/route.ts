import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const AUTH_INTERNAL_URL = process.env.AUTH_INTERNAL_URL ?? 'http://127.0.0.1:3101';
const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? 'orasage_token';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  locale?: unknown;
  category?: unknown;
  orderNo?: unknown;
};

function fieldString(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/** 「联系我们」表单提交 → auth-service 留言工单（游客可提交，登录用户附 userId） */
export async function POST(req: Request) {
  let payload: ContactPayload;
  try {
    payload = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const name = fieldString(payload.name, 100);
  const email = fieldString(payload.email, 320);
  const subject = fieldString(payload.subject, 200);
  const message = fieldString(payload.message, 5000);
  const locale = fieldString(payload.locale, 10);
  const category = fieldString(payload.category, 20);
  const orderNo = fieldString(payload.orderNo, 64);
  const allowedCategories = new Set(['general', 'complaint', 'refund', 'bug']);

  if (!name || !message) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  // 已登录则关联 userId（失败不阻塞游客提交）
  let userId: number | null = null;
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE_NAME)?.value;
  if (token) {
    try {
      const authRes = await fetch(`${AUTH_INTERNAL_URL}/auth/me`, {
        headers: { Cookie: `${JWT_COOKIE_NAME}=${token}` },
        cache: 'no-store',
      });
      if (authRes.ok) {
        const data = await authRes.json().catch(() => ({}));
        const id = Number(data.user?.id);
        if (Number.isFinite(id) && id > 0) userId = id;
      }
    } catch {
      // 忽略登录态解析失败
    }
  }

  const res = await fetch(`${AUTH_INTERNAL_URL}/internal/contact-messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      name,
      email,
      subject: subject || undefined,
      body: message,
      locale: locale || undefined,
      category: allowedCategories.has(category) ? category : 'general',
      orderNo: orderNo || undefined,
    }),
  });

  if (!res.ok) {
    console.error('[api/contact] auth-service error:', res.status, await res.text().catch(() => ''));
    return NextResponse.json({ error: 'submit_failed' }, { status: 502 });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json({ success: true, id: data.id ?? null }, { status: 201 });
}
