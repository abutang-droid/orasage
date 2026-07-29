'use client';

import { useLocale, useTranslations } from 'next-intl';
import { mainPortalUrl } from '@/lib/orasage-app-shell/config';

/** PC 页脚 — 版权 / 隐私 / 服务条款（仅桌面显示，见 app-shell.css） */
export function PortalFooter() {
  const locale = useLocale();
  const t = useTranslations('footer');
  const base = mainPortalUrl(locale);

  return (
    <footer className="orasage-portal-footer safe-bottom mt-auto">
      <div className="orasage-portal-footer-inner">
        <p className="orasage-portal-footer-copy">{t('copyright')}</p>
        <div className="orasage-portal-footer-links">
          <a href={`${base}/privacy`} className="orasage-portal-footer-link">
            {t('privacy')}
          </a>
          <a href={`${base}/terms`} className="orasage-portal-footer-link">
            {t('terms')}
          </a>
        </div>
      </div>
    </footer>
  );
}
