import { NextRequest, NextResponse } from 'next/server';
import { fetchTarotDailyRecommendProduct } from '@/lib/tarot-billing-config';

export async function GET(req: NextRequest) {
  const seed = req.nextUrl.searchParams.get('seed')?.trim();
  if (!seed) {
    return NextResponse.json({ error: '缺少 seed' }, { status: 400 });
  }
  const locale = req.nextUrl.searchParams.get('locale') ?? 'zh-CN';
  const product = await fetchTarotDailyRecommendProduct(seed, locale);
  if (!product) {
    return NextResponse.json({ error: '暂无推荐商品' }, { status: 404 });
  }
  return NextResponse.json({ product });
}
