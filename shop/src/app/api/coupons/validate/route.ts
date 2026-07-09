import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/env';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${ENV.authInternalUrl}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[shop] coupon validate:', err);
    return NextResponse.json({ error: '验证失败' }, { status: 500 });
  }
}
