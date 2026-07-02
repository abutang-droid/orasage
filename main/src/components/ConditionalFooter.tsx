import { headers } from 'next/headers';
import { Footer } from '@/components/Footer';
import { isMainPortalHome } from '@/lib/orasage-app-shell/config';
import { ORASAGE_PATHNAME_HEADER } from '@/lib/portal-pathname';

/** 仅 Main 门户首页显示页脚；其余页面用固定底栏导航 */
export async function ConditionalFooter() {
  const headersList = await headers();
  const pathname = headersList.get(ORASAGE_PATHNAME_HEADER) ?? '/';
  if (!isMainPortalHome(pathname)) return null;
  return <Footer />;
}
