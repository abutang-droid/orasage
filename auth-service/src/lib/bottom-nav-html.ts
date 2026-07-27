import { pickLabel, SHELL_LABELS } from '../../../shared/app-shell/labels.ts';
import { siteUrls } from './site-urls.ts';

/** 静态页固定底栏 HTML（与 shared/app-shell 一致：塔罗/八字/祈福/商店/我的） */
export function bottomNavHtml(locale = 'zh-CN'): string {
  const u = siteUrls();
  const profile = `${u.main}/${locale}/profile`;
  const tarot = pickLabel(SHELL_LABELS.tarot, locale);
  const bazi = pickLabel(SHELL_LABELS.bazi, locale);
  const blessing = pickLabel(SHELL_LABELS.blessing, locale);
  const shop = pickLabel(SHELL_LABELS.shop, locale);
  const mine = pickLabel(SHELL_LABELS.mine, locale);

  return `
<div class="orasage-app-shell" data-theme="light">
<nav class="orasage-app-bottomnav" aria-label="App navigation">
  <div class="orasage-app-bottomnav-inner">
    <a href="${u.tarot}" class="orasage-app-nav-item" data-active="false">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--shell-muted)" stroke-width="1.6"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M5 19l1-3 3-1-3-1-1-3-1 3-3 1 3 1 1 3z"/></svg>
      <span>${tarot}</span>
    </a>
    <a href="${u.bazi}" class="orasage-app-nav-item" data-active="false">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--shell-muted)" stroke-width="1.6"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
      <span>${bazi}</span>
    </a>
    <a href="${u.temple}" class="orasage-app-nav-item" data-active="false">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--shell-muted)" stroke-width="1.6"><path d="M12 3v3M8 6l2 2M16 6l-2 2"/><path d="M6 10h12v10H6z"/></svg>
      <span>${blessing}</span>
    </a>
    <a href="${u.shop}" class="orasage-app-nav-item" data-active="false">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--shell-muted)" stroke-width="1.6"><path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="19" r="1.5"/><circle cx="18" cy="19" r="1.5"/></svg>
      <span>${shop}</span>
    </a>
    <a href="${profile}" class="orasage-app-nav-item" data-active="false">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--shell-muted)" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
      <span>${mine}</span>
    </a>
  </div>
</nav>
</div>`;
}
