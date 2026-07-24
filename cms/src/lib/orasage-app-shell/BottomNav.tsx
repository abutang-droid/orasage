'use client';

import { useEffect, useState } from 'react';
import { Flame, Layers, ShoppingCart, Sparkles, User } from 'lucide-react';
import {
  appHomeUrl,
  getSiteApex,
  isOnProfile,
  isOnTemple,
  orasageUrlsFor,
  resolveClientSiteApex,
  type NavContext,
} from './config';
import { pickLabel, SHELL_LABELS } from './labels';

const ICON_SIZE = 20;
const ICON_STROKE = 1.6;

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? 'var(--shell-gold)' : 'var(--shell-muted)';
  const props = { size: ICON_SIZE, strokeWidth: ICON_STROKE, color, 'aria-hidden': true as const };
  switch (name) {
    case 'tarot':
      return <Sparkles {...props} />;
    case 'bazi':
      return <Layers {...props} />;
    case 'blessing':
      return <Flame {...props} />;
    case 'shop':
      return <ShoppingCart {...props} />;
    case 'mine':
      return <User {...props} />;
    default:
      return <Sparkles {...props} />;
  }
}

export type FixedBottomNavProps = {
  context: NavContext;
  locale?: string;
  pathname?: string;
};

/** Append locale query so cross-subdomain hops keep language even if cookies race. */
function withLocaleQuery(href: string, locale: string, param: 'lang' | 'locale'): string {
  if (!locale) return href;
  try {
    const url = new URL(href, typeof window !== 'undefined' ? window.location.origin : 'https://orasage.com');
    url.searchParams.set(param, locale);
    // Preserve absolute vs relative form of the original href
    if (/^https?:\/\//i.test(href)) return url.toString();
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    const join = href.includes('?') ? '&' : '?';
    return `${href}${join}${param}=${encodeURIComponent(locale)}`;
  }
}

function navUrls(locale: string, context: NavContext, apex: string) {
  const urls = orasageUrlsFor(apex);
  return {
    tarot: withLocaleQuery(appHomeUrl('tarot', apex), locale, 'lang'),
    bazi: withLocaleQuery(appHomeUrl('bazi', apex), locale, 'lang'),
    // Same-app relative path when already on tarot (avoids wrong apex bake)
    temple: withLocaleQuery(context === 'tarot' ? '/temple' : urls.temple, locale, 'lang'),
    shop: withLocaleQuery(urls.shop, locale, 'locale'),
    profile: `${urls.main}/${locale}/profile`,
  };
}

/**
 * 固定底栏 5 键 — 全站移动壳（含宽屏，不再切换 PC 顶栏）
 * 塔罗 · 八字 · 祈福 · 商店 · 我的
 */
export function FixedBottomNav({ context, locale = 'zh-CN', pathname = '/' }: FixedBottomNavProps) {
  // SSR / first paint: env apex (hydration-safe). After mount: hostname apex.
  const [hrefs, setHrefs] = useState(() => navUrls(locale, context, getSiteApex()));

  useEffect(() => {
    setHrefs(navUrls(locale, context, resolveClientSiteApex()));
  }, [locale, context]);

  const onTarot = context === 'tarot' && !isOnTemple(pathname);
  const onBazi = context === 'bazi';
  const onTemple = isOnTemple(pathname);
  const onShop = context === 'shop';
  const onProfile = context === 'portal' && isOnProfile(pathname);

  return (
    <nav className="orasage-app-bottomnav" aria-label="App navigation">
      <div className="orasage-app-bottomnav-inner">
        <a href={hrefs.tarot} className="orasage-app-nav-item" data-active={onTarot ? 'true' : 'false'}>
          <NavIcon name="tarot" active={onTarot} />
          <span>{pickLabel(SHELL_LABELS.tarot, locale)}</span>
        </a>

        <a href={hrefs.bazi} className="orasage-app-nav-item" data-active={onBazi ? 'true' : 'false'}>
          <NavIcon name="bazi" active={onBazi} />
          <span>{pickLabel(SHELL_LABELS.bazi, locale)}</span>
        </a>

        <a href={hrefs.temple} className="orasage-app-nav-item" data-active={onTemple ? 'true' : 'false'}>
          <NavIcon name="blessing" active={onTemple} />
          <span>{pickLabel(SHELL_LABELS.blessing, locale)}</span>
        </a>

        <a href={hrefs.shop} className="orasage-app-nav-item" data-active={onShop ? 'true' : 'false'}>
          <NavIcon name="shop" active={onShop} />
          <span>{pickLabel(SHELL_LABELS.shop, locale)}</span>
        </a>

        <a href={hrefs.profile} className="orasage-app-nav-item" data-active={onProfile ? 'true' : 'false'}>
          <NavIcon name="mine" active={onProfile} />
          <span>{pickLabel(SHELL_LABELS.mine, locale)}</span>
        </a>
      </div>
    </nav>
  );
}
