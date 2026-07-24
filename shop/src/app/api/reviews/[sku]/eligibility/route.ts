import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/env';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sku: string }> },
) {
  const { sku } = await params;
  const jar = req.cookies;
  const cookieName = process.env.JWT_COOKIE_NAME ?? 'orasage_token';
  const token = jar.get(cookieName)?.value;
  const headers: HeadersInit = {};
  if (token) headers.Cookie = `${cookieName}=${token}`;

  try {
    const res = await fetch(
      `${ENV.authInternalUrl}/api/reviews/products/${encodeURIComponent(sku)}/eligibility`,
      { cache: 'no-store', headers },
    );
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.warn('[shop] review eligibility:', err);
    return NextResponse.json(
      { authenticated: false, canReview: false, reason: 'login_required', orderNo: null },
      { status: 200 },
    );
  }
}
