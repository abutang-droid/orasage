'use client';

import { useTranslations } from 'next-intl';
import { mainPortalUrl } from '@/lib/orasage-app-shell/config';
import { useShopLocale } from '@/components/ShopLocaleProvider';

/** PC 页脚 — 版权 / 隐私 / 服务条款（仅桌面显示，见 app-shell.css） */
export function PortalFooter() {
  const { locale } = useShopLocale();
  const t = useTranslations('home');
  const base = mainPortalUrl(locale);

  return (
    <footer className="orasage-portal-footer safe-bottom mt-auto">
      <div className="orasage-portal-footer-inner">
        <p className="orasage-portal-footer-copy">{t('footerCopyright')}</p>
        <div className="orasage-portal-footer-links">
          <a href={`${base}/privacy`} className="orasage-portal-footer-link">
            {t('footerPrivacy')}
          </a>
          <a href={`${base}/terms`} className="orasage-portal-footer-link">
            {t('footerTerms')}
          </a>
        </div>
      </div>
    </footer>
  );
}
