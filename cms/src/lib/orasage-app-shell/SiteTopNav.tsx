'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Menu, Search, ShoppingCart, X } from 'lucide-react';
import { appBrandLabel, appHomeUrl, mainPortalUrl, type NavContext } from './config';
import { getPrimaryNavCategories, getUtilityNav, type NavCategory, type NavLink } from './primary-nav';
import { LocaleSwitcher } from './LocaleSwitcher';
import { OrasageAuthChip } from './OrasageAuthChip';
import { pickLabel, SHELL_LABELS } from './labels';

function NavDropdown({ category }: { category: NavCategory }) {
  const children = category.children ?? [];
  if (children.length === 0) {
    return (
      <a href={category.href} className="orasage-site-topnav-link">
        {category.label}
      </a>
    );
  }

  return (
    <div className="orasage-site-nav-dd">
      <a href={category.href} className="orasage-site-topnav-link orasage-site-nav-dd-trigger">
        {category.label}
        <span aria-hidden className="orasage-site-nav-dd-caret">
          ▾
        </span>
      </a>
      <div className="orasage-site-nav-dd-menu" role="menu">
        {children.map((child: NavLink) => (
          <a key={child.id} href={child.href} className="orasage-site-nav-dd-item" role="menuitem">
            {child.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function MeMenu({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const util = getUtilityNav(locale);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className="orasage-site-nav-dd orasage-site-nav-util" ref={ref}>
      <button
        type="button"
        className="orasage-site-topnav-link orasage-site-nav-dd-trigger"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={pickLabel(SHELL_LABELS.mine, locale)}
        onClick={() => setOpen((v) => !v)}
      >
        {pickLabel(SHELL_LABELS.mine, locale)}
        <span aria-hidden className="orasage-site-nav-dd-caret">
          ▾
        </span>
      </button>
      {open && (
        <div className="orasage-site-nav-dd-menu" role="menu">
          <a href={util.profile.href} className="orasage-site-nav-dd-item" role="menuitem">
            {util.profile.label}
          </a>
          <a href={util.myReadings.href} className="orasage-site-nav-dd-item" role="menuitem">
            {util.myReadings.label}
          </a>
          <div className="orasage-site-nav-dd-chip">
            <OrasageAuthChip locale={locale} />
          </div>
        </div>
      )}
    </div>
  );
}

function MobileNavPanel({
  locale,
  onClose,
}: {
  locale: string;
  onClose: () => void;
}) {
  const categories = getPrimaryNavCategories(locale);
  const util = getUtilityNav(locale);

  return (
    <nav
      id="orasage-mobile-nav-panel"
      className="orasage-site-mobile-nav-panel"
      aria-label={pickLabel(SHELL_LABELS.menu, locale)}
    >
      {categories.map((cat) => (
        <div key={cat.id} className="orasage-site-mobile-nav-section">
          <a href={cat.href} className="orasage-site-mobile-nav-heading" onClick={onClose}>
            {cat.label}
          </a>
          {(cat.children ?? []).map((child) => (
            <a key={child.id} href={child.href} className="orasage-site-mobile-nav-link" onClick={onClose}>
              {child.label}
            </a>
          ))}
        </div>
      ))}
      <div className="orasage-site-mobile-nav-utilities">
        <a href={util.search.href} className="orasage-site-mobile-nav-link" onClick={onClose}>
          {util.search.label}
        </a>
        <a href={util.profile.href} className="orasage-site-mobile-nav-link" onClick={onClose}>
          {util.profile.label}
        </a>
        <a href={util.myReadings.href} className="orasage-site-mobile-nav-link" onClick={onClose}>
          {util.myReadings.label}
        </a>
        <a href={util.cart.href} className="orasage-site-mobile-nav-link" onClick={onClose}>
          {util.cart.label}
        </a>
      </div>
    </nav>
  );
}

export type SiteTopNavProps = {
  locale?: string;
  /** portal = OraSage；子应用 = 独立品牌（BaZi / ZiWei / Manto） */
  context?: NavContext;
  /** 导航右侧、工具位前的插槽（如 shop 本地购物车覆盖） */
  trailing?: ReactNode;
  showLocaleSwitcher?: boolean;
  /** 覆盖默认 LocaleSwitcher（如 main 的 PortalLocaleSwitcher） */
  localeSwitcher?: ReactNode;
  onLocaleChange?: (locale: string) => void;
};

/** 全站顶栏 — PC 水平菜单；移动折叠菜单按钮 */
export function SiteTopNav({
  locale = 'zh-CN',
  context = 'portal',
  trailing = null,
  showLocaleSwitcher = true,
  localeSwitcher = null,
  onLocaleChange,
}: SiteTopNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isPortal = context === 'portal';
  const brandLabel = isPortal ? 'OraSage' : appBrandLabel(context, locale);
  const brandHref = isPortal ? mainPortalUrl(locale) : appHomeUrl(context);
  const categories = getPrimaryNavCategories(locale);
  const util = getUtilityNav(locale);
  const menuLabel = pickLabel(SHELL_LABELS.menu, locale);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const localeControl =
    localeSwitcher ??
    (showLocaleSwitcher ? (
      <LocaleSwitcher locale={locale} context={context} onLocaleChange={onLocaleChange} />
    ) : null);

  return (
    <>
      <header className="orasage-site-topnav">
        <div className="orasage-site-topnav-inner">
          <a href={brandHref} className="orasage-site-topnav-brand">
            {brandLabel}
          </a>

          <nav className="orasage-site-topnav-menu orasage-site-topnav-menu--desktop" aria-label="Site navigation">
            {categories.map((cat) => (
              <NavDropdown key={cat.id} category={cat} />
            ))}
            <a
              href={util.search.href}
              className="orasage-site-topnav-icon"
              aria-label={util.search.label}
              title={util.search.label}
            >
              <Search size={18} strokeWidth={1.6} aria-hidden />
            </a>
            <MeMenu locale={locale} />
            {trailing ?? (
              <a
                href={util.cart.href}
                className="orasage-site-topnav-icon"
                aria-label={util.cart.label}
                title={util.cart.label}
              >
                <ShoppingCart size={18} strokeWidth={1.6} aria-hidden />
              </a>
            )}
            {localeControl}
          </nav>

          <div className="orasage-site-topnav-mobile-actions">
            <a
              href={util.search.href}
              className="orasage-site-topnav-icon"
              aria-label={util.search.label}
              title={util.search.label}
            >
              <Search size={18} strokeWidth={1.6} aria-hidden />
            </a>
            {localeControl}
            <OrasageAuthChip locale={locale} />
            <button
              type="button"
              className="orasage-site-mobile-nav-toggle"
              aria-expanded={mobileOpen}
              aria-controls="orasage-mobile-nav-panel"
              aria-label={menuLabel}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? (
                <X size={22} strokeWidth={1.8} aria-hidden />
              ) : (
                <Menu size={22} strokeWidth={1.8} aria-hidden />
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="orasage-site-mobile-nav-backdrop"
            aria-label={pickLabel(SHELL_LABELS.back, locale)}
            onClick={() => setMobileOpen(false)}
          />
          <MobileNavPanel locale={locale} onClose={() => setMobileOpen(false)} />
        </>
      )}
    </>
  );
}
