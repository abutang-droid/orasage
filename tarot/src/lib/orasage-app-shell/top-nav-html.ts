import { mainPortalUrl, ORASAGE_URLS } from './config';
import { pickLabel, SHELL_LABELS } from './labels';
import { getPrimaryNavCategories } from './primary-nav';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** 静态页顶栏 HTML（auth-service 等无 React 环境）— PC 水平菜单 + 移动折叠按钮 */
export function topNavHtml(locale = 'zh-CN'): string {
  const main = mainPortalUrl(locale);
  const categories = getPrimaryNavCategories(locale);
  const desktopLinks = categories
    .map((item) => `<a href="${esc(item.href)}" class="orasage-site-topnav-link">${esc(item.label)}</a>`)
    .join('\n          ');
  const mobileSections = categories
    .map((cat) => {
      const childLinks = (cat.children ?? [])
        .map(
          (child) =>
            `<a href="${esc(child.href)}" class="orasage-site-mobile-nav-link">${esc(child.label)}</a>`,
        )
        .join('\n          ');
      return `<div class="orasage-site-mobile-nav-section">
          <a href="${esc(cat.href)}" class="orasage-site-mobile-nav-heading">${esc(cat.label)}</a>
          ${childLinks}
        </div>`;
    })
    .join('\n        ');
  const login = pickLabel(SHELL_LABELS.login, locale);
  const search = pickLabel(SHELL_LABELS.search, locale);
  const cart = pickLabel(SHELL_LABELS.cart, locale);
  const menu = pickLabel(SHELL_LABELS.menu, locale);
  const mine = pickLabel(SHELL_LABELS.mine, locale);
  const myReadings = pickLabel(SHELL_LABELS.myReadings, locale);

  return `
<header class="orasage-site-topnav">
  <div class="orasage-site-topnav-inner">
    <a href="${main}" class="orasage-site-topnav-brand">OraSage</a>
    <nav class="orasage-site-topnav-menu orasage-site-topnav-menu--desktop" aria-label="Site navigation">
          ${desktopLinks}
      <a href="${main}/search" class="orasage-site-topnav-link">${esc(search)}</a>
      <a href="${ORASAGE_URLS.shop}/cart" class="orasage-site-topnav-link">${esc(cart)}</a>
      <a href="${ORASAGE_URLS.authLogin}?redirect=${encodeURIComponent(main)}" class="orasage-auth-chip" id="orasage-topnav-login">${esc(login)}</a>
    </nav>
    <div class="orasage-site-topnav-mobile-actions">
      <a href="${main}/search" class="orasage-site-topnav-icon" aria-label="${esc(search)}" title="${esc(search)}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      </a>
      <button type="button" class="orasage-site-mobile-nav-toggle" aria-expanded="false" aria-controls="orasage-mobile-nav-panel" aria-label="${esc(menu)}">
        <svg class="orasage-site-mobile-nav-icon-open" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        <svg class="orasage-site-mobile-nav-icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" hidden><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </div>
  </div>
</header>
<button type="button" class="orasage-site-mobile-nav-backdrop" hidden aria-label="${esc(pickLabel(SHELL_LABELS.back, locale))}"></button>
<nav id="orasage-mobile-nav-panel" class="orasage-site-mobile-nav-panel" hidden aria-label="${esc(menu)}">
        ${mobileSections}
  <div class="orasage-site-mobile-nav-utilities">
    <a href="${main}/search" class="orasage-site-mobile-nav-link">${esc(search)}</a>
    <a href="${main}/profile" class="orasage-site-mobile-nav-link">${esc(mine)}</a>
    <a href="${main}/profile/readings" class="orasage-site-mobile-nav-link">${esc(myReadings)}</a>
    <a href="${ORASAGE_URLS.shop}/cart" class="orasage-site-mobile-nav-link">${esc(cart)}</a>
  </div>
</nav>`;
}
