/** 静态页固定底栏 HTML（与 shared/app-shell 一致） */
export function bottomNavHtml(locale = 'zh-CN'): string {
  const main = `https://orasage.com/${locale}`;
  return `
<div class="orasage-app-shell" data-theme="light">
<nav class="orasage-app-bottomnav" aria-label="App navigation">
  <div class="orasage-app-bottomnav-inner">
    <a href="${main}" class="orasage-app-nav-item" data-active="false">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--shell-muted)" stroke-width="1.6"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/></svg>
      <span>首页</span>
    </a>
    <a href="${main}" class="orasage-app-nav-item" data-active="false">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--shell-muted)" stroke-width="1.6"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
      <span class="orasage-app-nav-brand">OraSage</span>
    </a>
    <a href="https://tarot.orasage.com/temple" class="orasage-app-nav-item" data-active="false">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--shell-muted)" stroke-width="1.6"><path d="M12 3v3M8 6l2 2M16 6l-2 2"/><path d="M6 10h12v10H6z"/></svg>
      <span>祈福</span>
    </a>
    <a href="https://shop.orasage.com" class="orasage-app-nav-item" data-active="false">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--shell-muted)" stroke-width="1.6"><path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="19" r="1.5"/><circle cx="18" cy="19" r="1.5"/></svg>
      <span>商店</span>
    </a>
    <a href="${main}/profile" class="orasage-app-nav-item" data-active="false">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--shell-muted)" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
      <span>我的</span>
    </a>
  </div>
</nav>
</div>`;
}
