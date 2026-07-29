import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getAdminUser, loginUrl, staffCan } from '@/lib/auth';

const APP_PACKS: Record<
  string,
  {
    title: string;
    permission: 'app.bazi' | 'app.ziwei' | 'app.tarot';
    summary: string;
    links: Array<{ label: string; href: string; note?: string }>;
  }
> = {
  bazi: {
    title: '八字',
    permission: 'app.bazi',
    summary: 'Config Pack：app.bazi。展示走 content，计费走 billing；本页仅概览与深链。',
    links: [
      { label: 'Hero', href: '/content/heroes?app=bazi' },
      { label: '信息流', href: '/content/feeds?app=bazi' },
      { label: '计费槽位', href: '/billing?app=bazi' },
    ],
  },
  ziwei: {
    title: '紫微',
    permission: 'app.ziwei',
    summary: 'Config Pack：app.ziwei。',
    links: [
      { label: 'Hero', href: '/content/heroes?app=ziwei' },
      { label: '信息流', href: '/content/feeds?app=ziwei' },
      { label: '计费槽位', href: '/billing?app=ziwei' },
    ],
  },
  tarot: {
    title: '塔罗',
    permission: 'app.tarot',
    summary: 'Config Pack：app.tarot。',
    links: [
      { label: 'Hero', href: '/content/heroes?app=tarot' },
      { label: '信仰与圣地', href: '/content/faith?app=tarot' },
      { label: '计费槽位', href: '/billing?app=tarot' },
    ],
  },
};

type Props = { params: Promise<{ appId: string }> };

export default async function AppPackOverviewPage({ params }: Props) {
  const user = await getAdminUser();
  if (!user) redirect(loginUrl());

  const { appId: raw } = await params;
  const appId = decodeURIComponent(raw).toLowerCase();
  const pack = APP_PACKS[appId];
  if (!pack) notFound();
  if (!staffCan(user, pack.permission)) redirect(loginUrl());

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>{pack.title}</h1>
        <p className="muted">{pack.summary}</p>
      </header>

      <section className="panel">
        <h2 style={{ fontSize: '1rem' }}>配置入口</h2>
        <ul style={{ margin: '0.75rem 0 0', paddingLeft: '1.25rem' }}>
          {pack.links.map((l) => (
            <li key={l.href} style={{ marginBottom: '0.5rem' }}>
              <Link href={l.href}>{l.label}</Link>
              {l.note ? <span className="muted"> — {l.note}</span> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2 style={{ fontSize: '1rem' }}>功能开关（L2）</h2>
        <p className="muted" style={{ margin: 0 }}>
          Phase A 占位。今日开关多在各 App 环境变量（L3）；Phase D 起迁入
          <code> app_settings(partnerId=orasage, appId)</code>。
        </p>
      </section>
    </div>
  );
}
