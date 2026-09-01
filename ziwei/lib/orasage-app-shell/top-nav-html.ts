import { mainPortalUrl, ORASAGE_URLS } from './config';
import { pickLabel, SHELL_LABELS } from './labels';
import { getPrimaryNavCategories } from './primary-nav';

/** 静态页 PC 顶栏 HTML（auth-service 等无 React 环境）— 扁平一级，无下拉 */
export function topNavHtml(locale = 'zh-CN'): string {
  const main = mainPortalUrl(locale);
  const items = getPrimaryNavCategories(locale).map((c) => ({
    href: c.href,
    label: c.label,
  }));
  const links = items
    .map((item) => `<a href="${item.href}" class="orasage-site-topnav-link">${item.label}</a>`)
    .join('\n          ');
  const login = pickLabel(SHELL_LABELS.login, locale);
  const search = pickLabel(SHELL_LABELS.search, locale);
  const cart = pickLabel(SHELL_LABELS.cart, locale);

  return `
<header class="orasage-site-topnav">
  <div class="orasage-site-topnav-inner">
    <a href="${main}" class="orasage-site-topnav-brand">OraSage</a>
    <nav class="orasage-site-topnav-menu" aria-label="Site navigation">
          ${links}
      <a href="${main}/search" class="orasage-site-topnav-link">${search}</a>
      <a href="${ORASAGE_URLS.shop}/cart" class="orasage-site-topnav-link">${cart}</a>
      <a href="${ORASAGE_URLS.authLogin}?redirect=${encodeURIComponent(main)}" class="orasage-auth-chip" id="orasage-topnav-login">${login}</a>
    </nav>
  </div>
</header>`;
}
