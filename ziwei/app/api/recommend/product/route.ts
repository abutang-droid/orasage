import { NextRequest, NextResponse } from 'next/server';

const AUTH_INTERNAL = process.env.AUTH_INTERNAL_URL || 'http://127.0.0.1:3101';

export async function GET(req: NextRequest) {
  const readingId = req.nextUrl.searchParams.get('readingId')?.trim();
  if (!readingId) {
    return NextResponse.json({ error: '缺少 readingId' }, { status: 400 });
  }
  const locale = req.nextUrl.searchParams.get('locale') ?? 'zh-CN';
  const res = await fetch(
    `${AUTH_INTERNAL}/api/ziwei/chat/recommend?readingId=${encodeURIComponent(readingId)}&locale=${encodeURIComponent(locale)}`,
    { cache: 'no-store' },
  );
  if (!res.ok) {
    return NextResponse.json(null, { status: res.status });
  }
  const data = await res.json();
  const p = data.product;
  return NextResponse.json({
    product: {
      sku: p.sku,
      name: p.name,
      desc: p.desc ?? p.description ?? '',
      priceDisplay: p.priceDisplay ?? '',
    },
  });
}
