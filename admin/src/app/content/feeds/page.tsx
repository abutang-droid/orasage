import { getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import { ContentBridgePage } from '@/components/ContentBridgePage';
import { cmsFeedPath } from '@/lib/content-bridge';
import { redirect } from 'next/navigation';

export default async function ContentFeedsBridge({
  searchParams,
}: {
  searchParams?: Promise<{ app?: string }>;
}) {
  const user = await getAdminUser();
  if (!user) redirect(loginUrl());
  if (!staffCan(user, 'content.feed') && user.role !== 'admin') {
    redirect('/');
  }
  const sp = (await searchParams) ?? {};
  const app = sp.app?.trim();
  return (
    <ContentBridgePage
      title="信息流"
      description={app ? `当前过滤应用：${app}` : '八字 / 紫微信息流。'}
      href={cmsFeedPath(app)}
      links={[
        { label: '八字信息流', href: '/content/feeds?app=bazi' },
        { label: '紫微信息流', href: '/content/feeds?app=ziwei' },
      ]}
    />
  );
}
