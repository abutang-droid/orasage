/** 门户顶栏：栏目名与返回按钮逻辑（pathname 不含 locale 前缀） */

export function getPortalSectionKey(pathname: string): string | null {
  const p = pathname.replace(/\/$/, '') || '/';
  if (p === '/') return null;
  if (p === '/famous' || p.startsWith('/famous/')) return 'famous';
  if (p === '/daozang' || p.startsWith('/daozang/')) return 'daozang';
  if (p === '/about') return 'about';
  if (p === '/terms') return 'terms';
  if (p === '/privacy') return 'privacy';
  if (p === '/faq') return 'faq';
  if (p === '/profile' || p.startsWith('/profile/')) return 'profile';
  return null;
}

/** 进入下级页面后显示返回（历史后退） */
export function shouldShowPortalBack(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  return segments.length >= 2;
}
