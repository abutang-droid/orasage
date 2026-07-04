import { headers } from 'next/headers';
import { Footer } from '@/components/Footer';
import { ProfileFooter } from '@/components/profile/ProfileFooter';
import { isMainPortalHome, isOnProfile } from '@/lib/orasage-app-shell/config';
import { ORASAGE_PATHNAME_HEADER } from '@/lib/portal-pathname';

/** 门户首页与「我的」子页 PC 显示页脚；移动端不展示 */
export async function ConditionalFooter() {
  const headersList = await headers();
  const pathname = headersList.get(ORASAGE_PATHNAME_HEADER) ?? '/';
  if (isMainPortalHome(pathname)) return <Footer />;
  if (isOnProfile(pathname)) return <ProfileFooter />;
  return null;
}
