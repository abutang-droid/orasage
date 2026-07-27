import { NextRequest, NextResponse } from 'next/server';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { buildTarotAccountRecommendSeed } from '@/lib/reading-stable';
import {
  fetchAuthProductBySku,
  fetchTarotDailyRecommendProduct,
} from '@/lib/tarot-billing-config';
import { resolveAiLocaleFromRequest } from '../../../../../../shared/ai-locale/index';

/** 塔罗每日推荐饰品：优先按牌面对应 SKU 取价；否则账号绑定 slot */
export async function GET(req: NextRequest) {
  const ensured = await ensureAuthUser();
  const locale = resolveAiLocaleFromRequest(req);
  const seed = buildTarotAccountRecommendSeed(ensured.userId);
  const sku = req.nextUrl.searchParams.get('sku')?.trim() || '';

  const product = sku
    ? (await fetchAuthProductBySku(sku, locale))
      ?? (await fetchTarotDailyRecommendProduct(seed, locale))
    : await fetchTarotDailyRecommendProduct(seed, locale);

  if (!product) {
    const res = NextResponse.json({ error: '暂无推荐商品' }, { status: 404 });
    if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
    return res;
  }
  const res = NextResponse.json({ product, seed });
  if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
  return res;
}
