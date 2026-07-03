/** 静态页 PC 顶栏 HTML（与 shared/app-shell/top-nav-html 保持一致） */
export function topNavHtml(locale = 'zh-CN'): string {
  const main = `https://orasage.com/${locale}`;
  const items = [
    { href: 'https://bazi.orasage.com', label: '八字' },
    { href: 'https://ziwei.orasage.com', label: '紫微' },
    { href: 'https://tarot.orasage.com', label: '塔罗牌' },
    { href: `${main}/famous`, label: '名人案例' },
    { href: `${main}/daozang`, label: '道藏' },
  ];
  const links = items
    .map((item) => `<a href="${item.href}" class="orasage-site-topnav-link">${item.label}</a>`)
    .join('\n          ');

  return `
<header class="orasage-site-topnav">
  <div class="orasage-site-topnav-inner">
    <a href="${main}" class="orasage-site-topnav-brand">OraSage</a>
    <nav class="orasage-site-topnav-menu" aria-label="Site navigation">
          ${links}
    </nav>
    <div class="orasage-site-topnav-auth">
      <a href="https://auth.orasage.com/login?redirect=${encodeURIComponent(main)}" class="orasage-auth-chip" id="orasage-topnav-login">登录</a>
    </div>
  </div>
</header>`;
}
