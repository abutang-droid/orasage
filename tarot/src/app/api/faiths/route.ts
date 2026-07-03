import { NextResponse } from 'next/server';
import { fetchFaithsWithFallback, splitFaithsByRank } from '@/lib/cms/faiths';

/** GET /api/faiths — 宗教列表（CMS 优先，本地种子回退） */
export async function GET() {
  try {
    const { faiths, source } = await fetchFaithsWithFallback();
    const { top, more } = splitFaithsByRank(faiths);
    return NextResponse.json({ faiths, top, more, source });
  } catch (err) {
    console.error('[api/faiths]', err);
    return NextResponse.json({ error: '加载信仰列表失败' }, { status: 500 });
  }
}
