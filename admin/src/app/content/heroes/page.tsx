import { getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import { ContentBridgePage } from '@/components/ContentBridgePage';
import { cmsHeroPath } from '@/lib/content-bridge';
import { redirect } from 'next/navigation';

export default async function ContentHeroesBridge({
  searchParams,
}: {
  searchParams?: Promise<{ app?: string }>;
}) {
  const user = await getAdminUser();
  if (!user) redirect(loginUrl());
  if (!staffCan(user, 'content.heroes') && user.role !== 'admin') {
    redirect('/');
  }
  const sp = (await searchParams) ?? {};
  const app = sp.app?.trim();
  return (
    <ContentBridgePage
      title="各站 Hero"
      description={app ? `当前过滤应用：${app}` : '选择站点 Hero，或从应用概览深链进入。'}
      href={cmsHeroPath(app)}
      links={[
        { label: '门户', href: '/content/heroes?app=main' },
        { label: '商城', href: '/content/heroes?app=shop' },
        { label: '八字', href: '/content/heroes?app=bazi' },
        { label: '紫微', href: '/content/heroes?app=ziwei' },
        { label: '塔罗', href: '/content/heroes?app=tarot' },
      ]}
    />
  );
}
