import { NextResponse } from 'next/server';
import {
  fallbackZiweiHomeHero,
  resolveZiweiHeroFromRaw,
} from '@/lib/cms-ziwei-hero';

const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';

const SERVER_FALLBACK = fallbackZiweiHomeHero({
  eyebrow: '紫微斗数',
  title: '紫微斗数在线排盘',
  subtitle: '输入生辰，即刻生成命盘',
});

/** 同源代理 CMS 紫微 Hero，服务端完成映射与媒体可达性降级 */
export async function GET() {
  try {
    const res = await fetch(`${CMS_INTERNAL_URL}/api/globals/ziwei-home-hero?depth=1`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json(SERVER_FALLBACK, {
        headers: { 'Cache-Control': 'no-store' },
      });
    }
    const data = await res.json();
    const resolved = await resolveZiweiHeroFromRaw(data, SERVER_FALLBACK);
    return NextResponse.json(resolved, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json(SERVER_FALLBACK, {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
