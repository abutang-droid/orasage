import { NextResponse } from 'next/server';
import { fetchGeoRegionsWithFallback } from '@/lib/cms/geo';

/** GET /api/geo/regions — 大洲列表（地图热点） */
export async function GET() {
  try {
    const { regions, source } = await fetchGeoRegionsWithFallback();
    return NextResponse.json({ regions, source });
  } catch (err) {
    console.error('[api/geo/regions]', err);
    return NextResponse.json({ error: '加载大洲列表失败' }, { status: 500 });
  }
}
