import { NextRequest, NextResponse } from 'next/server';
import { fetchGeoCountriesWithFallback } from '@/lib/cms/geo';

/** GET /api/geo/countries?region=asia — 国家列表 */
export async function GET(req: NextRequest) {
  const region = req.nextUrl.searchParams.get('region')?.trim() || undefined;
  try {
    const { countries, source } = await fetchGeoCountriesWithFallback(region);
    return NextResponse.json({ countries, source, region: region ?? null });
  } catch (err) {
    console.error('[api/geo/countries]', err);
    return NextResponse.json({ error: '加载国家列表失败' }, { status: 500 });
  }
}
