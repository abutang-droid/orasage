import { mainPortalUrl } from './config';
import { pickLabel, SHELL_LABELS } from './labels';
import { Disclaimer } from './Disclaimer';

export type PortalFooterProps = {
  /** Must be the same locale as AppShell nav (not a delayed i18n provider). */
  locale: string;
};

/**
 * 全站页脚 — 上行功效免责声明，下行版权 + 隐私/条款（与 main Footer 一致）。
 */
export function PortalFooter({ locale }: PortalFooterProps) {
  const base = mainPortalUrl(locale);

  return (
    <footer className="orasage-portal-footer safe-bottom mt-auto">
      <div className="orasage-portal-footer-inner">
        <Disclaimer variant="standard" locale={locale} compact className="orasage-portal-footer-disclaimer" />
        <div className="orasage-portal-footer-meta">
          <p className="orasage-portal-footer-copy">
            {pickLabel(SHELL_LABELS.copyright, locale)}
          </p>
          <div className="orasage-portal-footer-links">
            <a href={`${base}/privacy`} className="orasage-portal-footer-link">
              {pickLabel(SHELL_LABELS.privacy, locale)}
            </a>
            <a href={`${base}/terms`} className="orasage-portal-footer-link">
              {pickLabel(SHELL_LABELS.terms, locale)}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
