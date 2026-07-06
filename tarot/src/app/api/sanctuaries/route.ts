import { NextRequest, NextResponse } from 'next/server';
import { fetchSanctuariesByFaith } from '@/lib/cms/sanctuaries';

/** GET /api/sanctuaries?faith=buddhism — 按宗教匹配 CMS 圣地列表 */
export async function GET(req: NextRequest) {
  const faith = req.nextUrl.searchParams.get('faith');
  try {
    const sanctuaries = await fetchSanctuariesByFaith(faith);
    return NextResponse.json({ sanctuaries, faith });
  } catch (err) {
    console.error('[api/sanctuaries]', err);
    return NextResponse.json({ error: '加载守护神失败' }, { status: 500 });
  }
}
