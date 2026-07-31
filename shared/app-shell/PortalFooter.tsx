import { mainPortalUrl } from './config';
import { pickLabel, SHELL_LABELS } from './labels';

export type PortalFooterProps = {
  /** Must be the same locale as AppShell nav (not a delayed i18n provider). */
  locale: string;
};

/**
 * PC portal footer — copyright / privacy / terms.
 * Driven by shell `locale` so it stays in sync with the language switcher.
 */
export function PortalFooter({ locale }: PortalFooterProps) {
  const base = mainPortalUrl(locale);

  return (
    <footer className="orasage-portal-footer safe-bottom mt-auto">
      <div className="orasage-portal-footer-inner">
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
    </footer>
  );
}
