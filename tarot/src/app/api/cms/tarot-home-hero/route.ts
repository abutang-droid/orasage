import { NextResponse } from 'next/server';
import { fallbackTarotHomeHero, resolveTarotHeroFromRaw } from '@/lib/cms-tarot-hero';

const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';

/** 同源代理 CMS 塔罗 Hero，服务端完成映射与媒体可达性降级 */
export async function GET() {
  try {
    const res = await fetch(`${CMS_INTERNAL_URL}/api/globals/tarot-home-hero?depth=1`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json(fallbackTarotHomeHero(), {
        headers: { 'Cache-Control': 'no-store' },
      });
    }
    const data = await res.json();
    const resolved = await resolveTarotHeroFromRaw(data);
    return NextResponse.json(resolved, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json(fallbackTarotHomeHero(), {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
