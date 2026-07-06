import { NextRequest, NextResponse } from 'next/server';
import { fetchFaithsForCountry } from '@/lib/cms/geo';
import { fetchFaithsWithFallback, splitFaithsByRank } from '@/lib/cms/faiths';

/** GET /api/faiths — 宗教列表；?country=BR 按国家主流程度排序 */
export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get('country')?.trim().toUpperCase();

  try {
    if (country) {
      const result = await fetchFaithsForCountry(country);
      const faiths = result.faiths;
      const primary = result.primary ?? faiths.filter((f) => 'isPrimary' in f && f.isPrimary);
      const top = faiths.slice(0, 10);
      const more = faiths.slice(10);
      return NextResponse.json({
        faiths,
        top,
        more,
        primary,
        source: result.source,
        countryCode: country,
        regional: result.regional,
      });
    }

    const { faiths, source } = await fetchFaithsWithFallback();
    const { top, more } = splitFaithsByRank(faiths);
    return NextResponse.json({ faiths, top, more, source });
  } catch (err) {
    console.error('[api/faiths]', err);
    return NextResponse.json({ error: '加载信仰列表失败' }, { status: 500 });
  }
}
