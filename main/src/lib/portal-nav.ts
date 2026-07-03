import { externalUrls } from '@/lib/urls';

export type PortalNavItemDef =
  | { id: 'bazi' | 'ziwei' | 'tarot'; href: string; external: true }
  | { id: 'famous' | 'daozang'; href: '/famous' | '/daozang'; external?: false };

/** Main portal navigation — shared by desktop header and mobile bottom bar */
export const PORTAL_NAV_ITEMS: PortalNavItemDef[] = [
  { id: 'bazi', href: externalUrls.bazi, external: true },
  { id: 'ziwei', href: externalUrls.ziwei, external: true },
  { id: 'tarot', href: externalUrls.tarot, external: true },
  { id: 'famous', href: '/famous' },
  { id: 'daozang', href: '/daozang' },
];

export function isPortalNavItemActive(pathname: string, item: PortalNavItemDef): boolean {
  if (item.external) return false;
  const p = pathname.replace(/\/$/, '') || '/';
  return p === item.href || p.startsWith(`${item.href}/`);
}
