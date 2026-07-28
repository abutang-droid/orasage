import { getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import { ContentBridgePage } from '@/components/ContentBridgePage';
import { CMS_BRIDGE } from '@/lib/content-bridge';
import { redirect } from 'next/navigation';

export default async function ContentMediaBridge() {
  const user = await getAdminUser();
  if (!user) redirect(loginUrl());
  if (!staffCan(user, 'content.cms.media') && !staffCan(user, 'content.cms') && user.role !== 'admin') {
    redirect('/');
  }
  return (
    <ContentBridgePage
      title="媒体库"
      description="全站上传媒体资源。"
      href={CMS_BRIDGE.media}
    />
  );
}
