'use client';

import { Flame, Home, LayoutGrid, ShoppingCart, User } from 'lucide-react';
import {
  ORASAGE_URLS,
  mainPortalUrl,
  profileUrl,
  isCurrentAppHome,
  isOnPortalHome,
  isOnProfile,
  isOnTemple,
  resolveSecondNavSlot,
  type NavContext,
} from './config';
import { pickLabel, SHELL_LABELS } from './labels';

const ICON_SIZE = 20;
const ICON_STROKE = 1.6;

/** 玄璧图形标（VI v1.0 §2.2）— 符号位仅图形，20px 档光学描边 */
function OrasageMark({ active }: { active: boolean }) {
  const color = active ? 'var(--shell-gold)' : 'var(--shell-muted)';
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 64 64" fill="none" aria-hidden>
      <path
        d="M 41.645 12.226 A 22 22 0 1 0 51.774 22.355"
        stroke={color}
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="5" fill={color} />
    </svg>
  );
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? 'var(--shell-gold)' : 'var(--shell-muted)';
  const props = { size: ICON_SIZE, strokeWidth: ICON_STROKE, color, 'aria-hidden': true as const };
  switch (name) {
    case 'home':
      return <Home {...props} />;
    case 'blessing':
      return <Flame {...props} />;
    case 'shop':
      return <ShoppingCart {...props} />;
    case 'mine':
      return <User {...props} />;
    case 'orasage':
      return <OrasageMark active={active} />;
    default:
      return <LayoutGrid {...props} />;
  }
}

export type FixedBottomNavProps = {
  context: NavContext;
  locale?: string;
  pathname?: string;
};

/**
 * 固定底栏 5 键 — 移动端全站
 * 1 首页 · 2 探索/当前应用（动态）· 3 祈福 · 4 商城 · 5 我的
 * 锚点页（首页/祈福/商城/我的）时第 2 键轮换至八字/塔罗/紫微/道藏/名人，避免与固定键重复
 */
export function FixedBottomNav({ context, locale = 'zh-CN', pathname = '/' }: FixedBottomNavProps) {
  const homeHref = mainPortalUrl(locale);
  const slot2 = resolveSecondNavSlot(context, pathname, locale);

  const onPortalHome = context === 'portal' && isOnPortalHome(pathname);
  const onTemple = isOnTemple(pathname);
  const onShop = context === 'shop' && isCurrentAppHome('shop', pathname);
  const onProfile = context === 'portal' && isOnProfile(pathname);

  return (
    <nav className="orasage-app-bottomnav" aria-label="App navigation">
      <div className="orasage-app-bottomnav-inner">
        <a
          href={homeHref}
          className="orasage-app-nav-item"
          data-active={onPortalHome ? 'true' : 'false'}
          aria-current={onPortalHome ? 'page' : undefined}
        >
          <NavIcon name="home" active={onPortalHome} />
          <span>{pickLabel(SHELL_LABELS.home, locale)}</span>
        </a>

        <a
          href={slot2.href}
          className="orasage-app-nav-item"
          data-active={slot2.active ? 'true' : 'false'}
          aria-current={slot2.active ? 'page' : undefined}
        >
          <NavIcon name={slot2.kind === 'orasage' ? 'orasage' : 'app'} active={slot2.active} />
          <span className="orasage-app-nav-brand">{slot2.label}</span>
        </a>

        <a
          href={ORASAGE_URLS.temple}
          className="orasage-app-nav-item"
          data-active={onTemple ? 'true' : 'false'}
          aria-current={onTemple ? 'page' : undefined}
        >
          <NavIcon name="blessing" active={onTemple} />
          <span>{pickLabel(SHELL_LABELS.blessing, locale)}</span>
        </a>

        <a
          href={ORASAGE_URLS.shop}
          className="orasage-app-nav-item"
          data-active={onShop ? 'true' : 'false'}
          aria-current={onShop ? 'page' : undefined}
        >
          <NavIcon name="shop" active={onShop} />
          <span>{pickLabel(SHELL_LABELS.shop, locale)}</span>
        </a>

        <a
          href={profileUrl(locale)}
          className="orasage-app-nav-item"
          data-active={onProfile ? 'true' : 'false'}
          aria-current={onProfile ? 'page' : undefined}
        >
          <NavIcon name="mine" active={onProfile} />
          <span>{pickLabel(SHELL_LABELS.mine, locale)}</span>
        </a>
      </div>
    </nav>
  );
}
