'use client';

import { BookOpen, Home, ShoppingCart, User } from 'lucide-react';
import {
  ORASAGE_URLS,
  mainPortalUrl,
  profileUrl,
  readingsUrl,
  isCurrentAppHome,
  isOnPortalHome,
  isOnProfile,
  type NavContext,
} from './config';
import { pickLabel, SHELL_LABELS } from './labels';

const ICON_SIZE = 20;
const ICON_STROKE = 1.6;

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? 'var(--shell-gold)' : 'var(--shell-muted)';
  const props = { size: ICON_SIZE, strokeWidth: ICON_STROKE, color, 'aria-hidden': true as const };
  switch (name) {
    case 'home':
      return <Home {...props} />;
    case 'shop':
      return <ShoppingCart {...props} />;
    case 'readings':
      return <BookOpen {...props} />;
    case 'mine':
      return <User {...props} />;
    default:
      return <Home {...props} />;
  }
}

export type FixedBottomNavProps = {
  context: NavContext;
  locale?: string;
  pathname?: string;
};

/**
 * 固定底栏 4 键 — EN/ZH 一致（Q4）
 * 1 首页 · 2 商城 · 3 测算 · 4 我的
 */
export function FixedBottomNav({ context, locale = 'zh-CN', pathname = '/' }: FixedBottomNavProps) {
  const homeHref = mainPortalUrl(locale);
  const readingsHref = readingsUrl(locale);

  const onPortalHome = context === 'portal' && isOnPortalHome(pathname);
  const onShop = context === 'shop' && isCurrentAppHome('shop', pathname);
  const onReadings =
    context === 'portal' &&
    (pathname === '/readings' || pathname.startsWith('/readings/'));
  const onProfile = context === 'portal' && isOnProfile(pathname);

  return (
    <nav className="orasage-app-bottomnav" aria-label="App navigation">
      <div className="orasage-app-bottomnav-inner">
        <a href={homeHref} className="orasage-app-nav-item" data-active={onPortalHome ? 'true' : 'false'}>
          <NavIcon name="home" active={onPortalHome} />
          <span>{pickLabel(SHELL_LABELS.home, locale)}</span>
        </a>

        <a href={ORASAGE_URLS.shop} className="orasage-app-nav-item" data-active={onShop ? 'true' : 'false'}>
          <NavIcon name="shop" active={onShop} />
          <span>{pickLabel(SHELL_LABELS.shop, locale)}</span>
        </a>

        <a
          href={readingsHref}
          className="orasage-app-nav-item"
          data-active={onReadings ? 'true' : 'false'}
        >
          <NavIcon name="readings" active={onReadings} />
          <span>{pickLabel(SHELL_LABELS.readings, locale)}</span>
        </a>

        <a href={profileUrl(locale)} className="orasage-app-nav-item" data-active={onProfile ? 'true' : 'false'}>
          <NavIcon name="mine" active={onProfile} />
          <span>{pickLabel(SHELL_LABELS.mine, locale)}</span>
        </a>
      </div>
    </nav>
  );
}
