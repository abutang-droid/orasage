import { useT } from '@/lib/i18n';
import { mainPortalUrl } from '@/lib/orasage-app-shell/config';

/** PC 页脚 — 与 main 门户首页一致（仅桌面显示） */
export function PortalFooter() {
  const { t, locale } = useT();
  const base = mainPortalUrl(locale);

  return (
    <footer className="orasage-portal-footer safe-bottom mt-auto">
      <div className="orasage-portal-footer-inner">
        <p className="orasage-portal-footer-copy">{t('footer.portal.copyright')}</p>
        <div className="orasage-portal-footer-links">
          <a href={`${base}/privacy`} className="orasage-portal-footer-link">
            {t('footer.portal.privacy')}
          </a>
          <a href={`${base}/terms`} className="orasage-portal-footer-link">
            {t('footer.portal.terms')}
          </a>
        </div>
      </div>
    </footer>
  );
}
