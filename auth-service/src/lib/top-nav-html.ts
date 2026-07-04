/** 静态页 PC 顶栏 HTML（与 shared/app-shell/top-nav-html 保持一致） */
export function topNavHtml(locale = 'zh-CN'): string {
  const main = `https://orasage.com/${locale}`;
  const homeLabel = locale.startsWith('zh') ? '首页' : 'Home';
  const items = [
    { href: main, label: homeLabel },
    { href: 'https://bazi.orasage.com', label: locale.startsWith('zh') ? '八字' : 'BaZi' },
    { href: 'https://ziwei.orasage.com', label: locale.startsWith('zh') ? '紫微' : 'Zi Wei' },
    { href: 'https://tarot.orasage.com', label: locale.startsWith('zh') ? '塔罗牌' : 'Tarot' },
    { href: 'https://shop.orasage.com', label: locale.startsWith('zh') ? '商店' : 'Shop' },
    { href: `${main}/famous`, label: locale.startsWith('zh') ? '名人案例' : 'Famous Cases' },
    { href: `${main}/daozang`, label: locale.startsWith('zh') ? '道藏' : 'Dao Canon' },
  ];
  const links = items
    .map((item) => `<a href="${item.href}" class="orasage-site-topnav-link">${item.label}</a>`)
    .join('\n          ');
  const login = locale.startsWith('zh') ? '登录' : 'Login';
  const loginHref = `https://auth.orasage.com/login?redirect=${encodeURIComponent(main)}`;
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
