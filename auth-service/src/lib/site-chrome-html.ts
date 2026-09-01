import { EXTENDED_LOCALES, toCoreLocale } from '../../../packages/i18n/src/index.ts';
import { getDisclaimerCopy } from '../../../shared/app-shell/disclaimer-copy.ts';
import { topNavHtml } from './top-nav-html.ts';
import { authLoginLabel } from './auth-page-copy.ts';

const LOCALES = EXTENDED_LOCALES;

type FooterStrings = { login: string; copyright: string; privacy: string; terms: string };

const FOOTER_STRINGS: Record<string, FooterStrings> = {
  'zh-CN': { login: '登录', copyright: '© 2026 OraSage. 保留所有权利。', privacy: '隐私政策', terms: '服务条款' },
  'zh-TW': { login: '登入', copyright: '© 2026 OraSage. 保留所有權利。', privacy: '隱私政策', terms: '服務條款' },
  en: { login: 'Login', copyright: '© 2026 OraSage. All rights reserved.', privacy: 'Privacy Policy', terms: 'Terms of Service' },
  'pt-BR': { login: 'Entrar', copyright: '© 2026 OraSage. Todos os direitos reservados.', privacy: 'Política de Privacidade', terms: 'Termos de Serviço' },
};

const normalizeLocale = toCoreLocale;

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

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

function authStrings(locale: string): FooterStrings {
  const key = normalizeLocale(locale);
  return FOOTER_STRINGS[key] ?? FOOTER_STRINGS.en;
}

/** PC 页脚 — 与 main Footer / 全站 shell 一致 */
export function footerHtml(locale: string): string {
  const main = mainPortalUrl(locale);
  const { copyright, privacy, terms } = authStrings(locale);
  const disc = getDisclaimerCopy('standard', locale);
  const discBody = disc.lines.join(' ');

  return `
<footer class="orasage-portal-footer orasage-auth-footer">
  <div class="orasage-portal-footer-inner">
    <aside class="orasage-disclaimer orasage-disclaimer--standard orasage-disclaimer--compact orasage-portal-footer-disclaimer" role="note" aria-label="${escHtml(disc.title)}">
      <p><strong>${escHtml(disc.title)}</strong> ${escHtml(discBody)}</p>
    </aside>
    <div class="orasage-portal-footer-meta">
      <p class="orasage-portal-footer-copy">${copyright}</p>
      <div class="orasage-portal-footer-links">
        <a href="${main}/privacy" class="orasage-portal-footer-link">${privacy}</a>
        <a href="${main}/terms" class="orasage-portal-footer-link">${terms}</a>
      </div>
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
  ${topNavHtml(locale)}
  <div class="orasage-auth-main">
    ${body}
  </div>
  ${footerHtml(locale)}
  <script src="/assets/app.js" defer></script>
</body>
</html>`;
}

/** @deprecated 移动顶栏已合并进 topNavHtml */
export function mobileNavHtml(locale: string): string {
  void locale;
  void authLoginLabel;
  return '';
}
