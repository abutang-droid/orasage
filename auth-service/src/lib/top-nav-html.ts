import { pickLabel, SHELL_LABELS } from '../../../shared/app-shell/labels.ts';
import { authLoginLabel } from './auth-page-copy.ts';
import { siteUrls } from './site-urls.ts';

/** 静态页 PC 顶栏 HTML（与 shared/app-shell 一致） */
export function topNavHtml(locale = 'zh-CN'): string {
  const u = siteUrls();
  const main = `${u.main}/${locale}`;
  const items = [
    { href: main, label: pickLabel(SHELL_LABELS.home, locale) },
    { href: u.bazi, label: pickLabel(SHELL_LABELS.bazi, locale) },
    { href: u.ziwei, label: pickLabel(SHELL_LABELS.ziwei, locale) },
    { href: u.tarot, label: pickLabel(SHELL_LABELS.tarot, locale) },
    { href: u.shop, label: pickLabel(SHELL_LABELS.shop, locale) },
    { href: `${main}/famous`, label: pickLabel(SHELL_LABELS.famous, locale) },
    { href: `${main}/daozang`, label: pickLabel(SHELL_LABELS.daozang, locale) },
  ];
  const links = items
    .map((item) => `<a href="${item.href}" class="orasage-site-topnav-link">${item.label}</a>`)
    .join('\n          ');
  const login = authLoginLabel(locale);
  const loginHref = `${u.auth}/login?redirect=${encodeURIComponent(main)}`;
  const profile = `${main}/profile`;

  return `
<header class="orasage-site-topnav">
  <div class="orasage-site-topnav-inner">
    <a href="${main}" class="orasage-site-topnav-brand">OraSage</a>
    <nav class="orasage-site-topnav-menu" aria-label="Site navigation">
          ${links}
      <a href="${loginHref}" class="orasage-auth-chip orasage-auth-chip--loading" data-hydrate-auth data-login-url="${loginHref}" data-profile-url="${profile}">${login}</a>
    </nav>
  </div>
</header>`;
}
