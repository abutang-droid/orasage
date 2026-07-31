'use client';

import { PortalFooter as ShellPortalFooter } from '@/lib/orasage-app-shell';
import { useShopLocale } from '@/components/ShopLocaleProvider';

/** PC 页脚 — 与顶栏共用 shell locale，避免切语言后 next-intl 未刷新时仍显示中文 */
export function PortalFooter() {
  const { locale } = useShopLocale();
  return <ShellPortalFooter locale={locale} />;
}
