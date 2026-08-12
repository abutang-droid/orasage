import { headers } from 'next/headers';
import { Footer } from '@/components/Footer';
import { isMainPortalHome, isOnProfile } from '@/lib/orasage-app-shell/config';
import { ORASAGE_PATHNAME_HEADER } from '@/lib/portal-pathname';
import { isPublicPolicyPath } from '@/lib/public-policies';

/** 门户首页、「我的」子页与公开公共政策页：PC 显示全站统一页脚；移动端不展示 */
export async function ConditionalFooter() {
  const headersList = await headers();
  const pathname = headersList.get(ORASAGE_PATHNAME_HEADER) ?? '/';
  if (isMainPortalHome(pathname) || isOnProfile(pathname) || isPublicPolicyPath(pathname)) {
    return <Footer />;
  }
  return null;
}
