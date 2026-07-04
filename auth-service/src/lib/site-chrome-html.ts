import { bottomNavHtml } from './bottom-nav-html.ts';
import { topNavHtml } from './top-nav-html.ts';

const LOCALES = ['zh-CN', 'zh-TW', 'en', 'pt-BR', 'es', 'fr', 'de', 'ja', 'ko', 'vi', 'th', 'ar'] as const;

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
  return `https://orasage.com/${locale}`;
}

function authStrings(locale: string) {
  const zh = locale.startsWith('zh');
  return {
    login: zh ? '登录' : 'Login',
    copyright: '© 2026 OraSage. All rights reserved.',
    privacy: zh ? '隐私政策' : 'Privacy',
    terms: zh ? '服务条款' : 'Terms',
  };
}

/** 移动顶栏 — 左品牌 + 右登录芯片（与子应用一致） */
export function mobileNavHtml(locale: string): string {
  const main = mainPortalUrl(locale);
  const { login } = authStrings(locale);
  const profile = `${main}/profile`;
  const loginHref = `https://auth.orasage.com/login?redirect=${encodeURIComponent(main)}`;

  return `
<header class="orasage-site-mobile-bar orasage-auth-mobile-bar">
  <a href="${main}" class="orasage-site-mobile-bar-brand">OraSage</a>
  <a href="${loginHref}" class="orasage-auth-chip orasage-auth-chip--loading" data-hydrate-auth data-login-url="${loginHref}" data-profile-url="${profile}">${login}</a>
</header>`;
}

/** PC 页脚 — 与 main Footer / DS §7 一致 */
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
  <link rel="stylesheet" href="/assets/orasage-ui.css">
  <link rel="stylesheet" href="/assets/style.css">
  <link rel="stylesheet" href="/assets/app-shell.css">
</head>
<body class="orasage-auth-body">
  ${topNavHtml(locale)}
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
