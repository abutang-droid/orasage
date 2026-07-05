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
    const errBody = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: (errBody as { error?: string }).error ?? '暂无推荐商品' },
      { status: res.status },
    );
  }
  const data = (await res.json()) as { product?: Record<string, unknown> };
  const p = data.product;
  if (!p || typeof p.sku !== 'string') {
    return NextResponse.json({ error: '暂无推荐商品' }, { status: 404 });
  }
  return NextResponse.json({
    product: {
      sku: p.sku,
      name: typeof p.name === 'string' ? p.name : '',
      desc: typeof p.desc === 'string' ? p.desc : typeof p.description === 'string' ? p.description : '',
      priceDisplay: typeof p.priceDisplay === 'string' ? p.priceDisplay : '',
    },
  });
}
