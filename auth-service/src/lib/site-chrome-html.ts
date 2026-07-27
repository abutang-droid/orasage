import { EXTENDED_LOCALES, toCoreLocale } from '../../../packages/i18n/src/index.ts';
import { bottomNavHtml } from './bottom-nav-html.ts';
import { authLoginLabel } from './auth-page-copy.ts';
import { siteUrls } from './site-urls.ts';

const LOCALES = EXTENDED_LOCALES;

type FooterStrings = { login: string; copyright: string; privacy: string; terms: string };

const FOOTER_STRINGS: Record<string, FooterStrings> = {
  'zh-CN': { login: '登录', copyright: '© 2026 OraSage. 保留所有权利。', privacy: '隐私政策', terms: '服务条款' },
  'zh-TW': { login: '登入', copyright: '© 2026 OraSage. 保留所有權利。', privacy: '隱私政策', terms: '服務條款' },
  en: { login: 'Login', copyright: '© 2026 OraSage. All rights reserved.', privacy: 'Privacy', terms: 'Terms' },
  'pt-BR': { login: 'Entrar', copyright: '© 2026 OraSage. Todos os direitos reservados.', privacy: 'Privacidade', terms: 'Termos' },
};

const normalizeLocale = toCoreLocale;

export function localeFromRedirect(url?: string): string {
  if (!url) return 'zh-CN';
  try {
    const pathname = url.startsWith('http') ? new URL(url).pathname : url;
    const seg = pathname.split('/').filter(Boolean)[0];
    if (seg && (LOCALES as readonly string[]).includes(seg)) return seg;
  } catch {
    /* ignore */
  }
  return 'zh-CN';
}

function mainPortalUrl(locale: string): string {
  return `${siteUrls().main}/${locale}`;
}

function authStrings(locale: string): FooterStrings {
  const key = normalizeLocale(locale);
  return FOOTER_STRINGS[key] ?? FOOTER_STRINGS.en;
}

/** 顶栏 — 左品牌 + 右登录芯片（与子应用一致；宽屏同移动壳） */
export function mobileNavHtml(locale: string): string {
  const main = mainPortalUrl(locale);
  const loginLabelText = authLoginLabel(locale);
  const profile = `${main}/profile`;
  const loginHref = `${siteUrls().auth}/login?redirect=${encodeURIComponent(main)}`;

  return `
<header class="orasage-site-mobile-bar orasage-auth-mobile-bar">
  <a href="${siteUrls().tarot}" class="orasage-site-mobile-bar-brand">OraSage</a>
  <a href="${loginHref}" class="orasage-auth-chip orasage-auth-chip--loading" data-hydrate-auth data-login-url="${loginHref}" data-profile-url="${profile}">${loginLabelText}</a>
</header>`;
}

/** 页脚 HTML（移动壳下由 CSS 隐藏） */
export function footerHtml(locale: string): string {
  const main = mainPortalUrl(locale);
  const { copyright, privacy, terms } = authStrings(locale);

  return `
<footer class="orasage-portal-footer orasage-auth-footer">
  <div class="orasage-portal-footer-inner">
    <p class="orasage-portal-footer-copy">${copyright}</p>
    <div class="orasage-portal-footer-links">
      <a href="${main}/privacy" class="orasage-portal-footer-link">${privacy}</a>
      <a href="${main}/terms" class="orasage-portal-footer-link">${terms}</a>
    </div>
  </div>
</footer>`;
}

export function authPageLayout(title: string, body: string, locale: string): string {
  return `<!DOCTYPE html>
<html lang="${locale}" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover">
  <meta name="theme-color" content="#fafaf8">
  <title>${title} — OraSage</title>
  <link rel="icon" href="/favicon.ico" sizes="32x32">
  <link rel="icon" type="image/svg+xml" href="/assets/brand/icon.svg">
  <link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png">
  <link rel="stylesheet" href="/assets/style.css">
  <link rel="stylesheet" href="/assets/app-shell.css">
</head>
<body class="orasage-auth-body">
  ${mobileNavHtml(locale)}
  <div class="orasage-auth-main">
    ${body}
  </div>
  ${footerHtml(locale)}
  ${bottomNavHtml(locale)}
  <script src="/assets/app.js" defer></script>
</body>
</html>`;
}
