import { getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import { ContentBridgePage } from '@/components/ContentBridgePage';
import { CMS_BRIDGE } from '@/lib/content-bridge';
import { redirect } from 'next/navigation';

export default async function ContentPagesBridge() {
  const user = await getAdminUser();
  if (!user) redirect(loginUrl());
  if (!staffCan(user, 'content.cms.pages') && !staffCan(user, 'content.cms') && user.role !== 'admin') {
    redirect('/');
  }
  return (
    <ContentBridgePage
      title="页面与文章"
      description="门户文章、道藏、名人案例等页面内容。"
      href={CMS_BRIDGE.pages}
    />
  );
}
