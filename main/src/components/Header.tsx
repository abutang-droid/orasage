'use client';

import { useLocale } from 'next-intl';
import { SiteTopNav } from '@/lib/orasage-app-shell/SiteTopNav';
import { PortalLocaleSwitcher } from '@/components/PortalLocaleSwitcher';

/** 门户顶栏：全端统一 SiteTopNav（PC 水平菜单 / 移动折叠菜单） */
export function Header() {
  const locale = useLocale();

  return (
    <div className="border-b border-border/80 bg-background [&_.orasage-site-topnav]:border-0 [&_.orasage-site-topnav]:bg-background">
      <SiteTopNav
        locale={locale}
        context="portal"
        localeSwitcher={<PortalLocaleSwitcher />}
        showLocaleSwitcher
      />
    </div>
  );
}
