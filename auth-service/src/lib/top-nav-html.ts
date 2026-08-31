import { pickLabel, SHELL_LABELS } from '../../../shared/app-shell/labels.ts';
import { getPrimaryNavCategories } from '../../../shared/app-shell/primary-nav.ts';
import { authLoginLabel } from './auth-page-copy.ts';

/** 静态页 PC 顶栏 HTML（与 shared/app-shell P1 IA 一致，扁平无下拉） */
export function topNavHtml(locale = 'zh-CN'): string {
  const main = `https://orasage.com/${locale}`;
  const items = getPrimaryNavCategories(locale).map((c) => ({
    href: c.href,
    label: c.label,
  }));
  const links = items
    .map((item) => `<a href="${item.href}" class="orasage-site-topnav-link">${item.label}</a>`)
    .join('\n          ');
  const login = authLoginLabel(locale);
  const loginHref = `https://auth.orasage.com/login?redirect=${encodeURIComponent(main)}`;
  const profile = `${main}/profile`;
  const search = pickLabel(SHELL_LABELS.search, locale);
  const cart = pickLabel(SHELL_LABELS.cart, locale);

  return `
<header class="orasage-site-topnav">
  <div class="orasage-site-topnav-inner">
    <a href="${main}" class="orasage-site-topnav-brand">OraSage</a>
    <nav class="orasage-site-topnav-menu" aria-label="Site navigation">
          ${links}
      <a href="${main}/search" class="orasage-site-topnav-link">${search}</a>
      <a href="https://shop.orasage.com/cart" class="orasage-site-topnav-link">${cart}</a>
      <a href="${loginHref}" class="orasage-auth-chip orasage-auth-chip--loading" data-hydrate-auth data-login-url="${loginHref}" data-profile-url="${profile}">${login}</a>
    </nav>
  </div>
</header>`;
}
