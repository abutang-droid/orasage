import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/env';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sku: string }> },
) {
  const { sku } = await params;
  try {
    const res = await fetch(
      `${ENV.authInternalUrl}/api/reviews/products/${encodeURIComponent(sku)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) throw new Error(`reviews ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn('[shop] ugc reviews:', err);
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(req: NextRequest) {
  const jar = req.cookies;
  const token = jar.get(process.env.JWT_COOKIE_NAME ?? 'orasage_token')?.value;
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers.Cookie = `${process.env.JWT_COOKIE_NAME ?? 'orasage_token'}=${token}`;

  try {
    const body = await req.json();
    const res = await fetch(`${ENV.authInternalUrl}/api/reviews`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[shop] submit review:', err);
    return NextResponse.json({ error: '提交失败' }, { status: 500 });
  }
}
