import {
  appHomeUrl,
  daozangUrl,
  famousUrl,
  mainPortalUrl,
  ORASAGE_URLS,
  shopUrl,
  templeUrl,
} from './config';
import { pickLabel, SHELL_LABELS } from './labels';

/** 静态页 PC 顶栏 HTML（与 SiteTopNav 一致，链接带 locale query） */
export function topNavHtml(locale = 'zh-CN'): string {
  const main = mainPortalUrl(locale);
  const items = [
    { href: main, label: pickLabel(SHELL_LABELS.home, locale) },
    { href: appHomeUrl('bazi', locale), label: pickLabel(SHELL_LABELS.bazi, locale) },
    { href: appHomeUrl('ziwei', locale), label: pickLabel(SHELL_LABELS.ziwei, locale) },
    { href: appHomeUrl('tarot', locale), label: pickLabel(SHELL_LABELS.tarot, locale) },
    { href: templeUrl(locale), label: pickLabel(SHELL_LABELS.blessing, locale) },
    { href: shopUrl(locale), label: pickLabel(SHELL_LABELS.shop, locale) },
    { href: famousUrl(locale), label: pickLabel(SHELL_LABELS.famous, locale) },
    { href: daozangUrl(locale), label: pickLabel(SHELL_LABELS.daozang, locale) },
  ];
  const links = items
    .map((item) => `<a href="${item.href}" class="orasage-site-topnav-link">${item.label}</a>`)
    .join('\n          ');
  const login = pickLabel(SHELL_LABELS.login, locale);
  const loginHref = `${ORASAGE_URLS.authLogin}?lang=${encodeURIComponent(locale)}&redirect=${encodeURIComponent(main)}`;

  return `
<header class="orasage-site-topnav">
  <div class="orasage-site-topnav-inner">
    <a href="${main}" class="orasage-site-topnav-brand">OraSage</a>
    <nav class="orasage-site-topnav-menu" aria-label="Site navigation">
          ${links}
      <a href="${loginHref}" class="orasage-auth-chip" id="orasage-topnav-login">${login}</a>
    </nav>
  </div>
</header>`;
}
