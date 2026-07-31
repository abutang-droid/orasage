import { useT } from '@/lib/i18n';
import { PortalFooter as ShellPortalFooter } from '@/lib/orasage-app-shell';

/** PC 页脚 — 与顶栏共用 shell locale */
export function PortalFooter() {
  const { locale } = useT();
  return <ShellPortalFooter locale={locale} />;
}
