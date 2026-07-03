import { daozangUrl, famousUrl, mainPortalUrl, ORASAGE_URLS } from './config';
import { pickLabel, SHELL_LABELS } from './labels';

/** 静态页 PC 顶栏 HTML（auth-service 等无 React 环境） */
export function topNavHtml(locale = 'zh-CN'): string {
  const main = mainPortalUrl(locale);
  const items = [
    { href: ORASAGE_URLS.bazi, label: pickLabel(SHELL_LABELS.bazi, locale) },
    { href: ORASAGE_URLS.ziwei, label: pickLabel(SHELL_LABELS.ziwei, locale) },
    { href: ORASAGE_URLS.tarot, label: pickLabel(SHELL_LABELS.tarot, locale) },
    { href: famousUrl(locale), label: pickLabel(SHELL_LABELS.famous, locale) },
    { href: daozangUrl(locale), label: pickLabel(SHELL_LABELS.daozang, locale) },
  ];
  const links = items
    .map((item) => `<a href="${item.href}" class="orasage-site-topnav-link">${item.label}</a>`)
    .join('\n          ');
  const login = pickLabel(SHELL_LABELS.login, locale);
  const profile = `${main}/profile`;

  return `
<header class="orasage-site-topnav">
  <div class="orasage-site-topnav-inner">
    <a href="${main}" class="orasage-site-topnav-brand">OraSage</a>
    <nav class="orasage-site-topnav-menu" aria-label="Site navigation">
          ${links}
    </nav>
    <div class="orasage-site-topnav-auth">
      <a href="${ORASAGE_URLS.authLogin}?redirect=${encodeURIComponent(main)}" class="orasage-auth-chip" id="orasage-topnav-login">${login}</a>
    </div>
  </div>
</header>`;
}
