import { NextRequest, NextResponse } from 'next/server';
import { fallbackTarotHomeHero, resolveTarotHeroFromRaw } from '@/lib/cms-tarot-hero';
import type { Lang } from '@/lib/i18n/context';

const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';

const LANGS = new Set<Lang>(['zh', 'en', 'pt', 'es']);

function parseLang(raw: string | null): Lang {
  if (!raw) return 'zh';
  const lower = raw.trim().toLowerCase();
  if (lower === 'zh-cn' || lower === 'zh') return 'zh';
  if (lower === 'zh-tw' || lower === 'zh-hk') return 'zh';
  if (lower === 'pt-br' || lower === 'pt') return 'pt';
  if (lower === 'en' || lower === 'en-us') return 'en';
  if (lower === 'es') return 'es';
  return LANGS.has(raw as Lang) ? (raw as Lang) : 'zh';
}

/** 同源代理 CMS 塔罗 Hero；按 ?lang= 用 UI 字典覆盖中文文案 */
export async function GET(req: NextRequest) {
  const lang = parseLang(req.nextUrl.searchParams.get('lang'));
  try {
    const res = await fetch(`${CMS_INTERNAL_URL}/api/globals/tarot-home-hero?depth=1`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json(fallbackTarotHomeHero(lang), {
        headers: { 'Cache-Control': 'no-store' },
      });
    }
    const data = await res.json();
    const resolved = await resolveTarotHeroFromRaw(data, lang);
    return NextResponse.json(resolved, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json(fallbackTarotHomeHero(lang), {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
