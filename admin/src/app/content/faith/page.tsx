import { getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import { ContentBridgePage } from '@/components/ContentBridgePage';
import { CMS_BRIDGE } from '@/lib/content-bridge';
import { redirect } from 'next/navigation';

export default async function ContentFaithBridge() {
  const user = await getAdminUser();
  if (!user) redirect(loginUrl());
  if (!staffCan(user, 'content.cms.faith') && !staffCan(user, 'content.cms') && user.role !== 'admin') {
    redirect('/');
  }
  return (
    <ContentBridgePage
      title="信仰与圣地"
      description="塔罗相关宗教 / 圣地 / 地理数据。"
      href={CMS_BRIDGE.faith}
    />
  );
}
