import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageShell, PageTitle, PageLead } from '@/components/PageShell';
import { Disclaimer } from '@/lib/orasage-app-shell/Disclaimer';
import { buildPortalPageMeta } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale.startsWith('zh');
  return buildPortalPageMeta({
    locale,
    pathname: '/origins',
    title: isZh ? '造物 | OraSage' : 'Origins | OraSage',
    description: isZh
      ? '造物记、工坊与缘起 — 讲清 $168 背后的工艺与选择。'
      : 'The Making, Atelier, and Our Story — the craft behind each piece.',
  });
}

export default async function OriginsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale.startsWith('zh');
  const t = (en: string, zh: string) => (isZh ? zh : en);

  const links = [
    {
      href: '/origins/the-making',
      title: t('The Making', '造物记'),
      desc: t('Five piece stories — design decisions you can verify.', '五款单品故事：可核对的设计决策。'),
    },
    {
      href: '/origins/atelier',
      title: t('Atelier', '工坊'),
      desc: t('How pieces are made, inspected, and packed.', '制作、品控与包装流程。'),
    },
    {
      href: '/origins/our-story',
      title: t('Our Story', '缘起'),
      desc: t('Why OraSage builds content commerce this way.', 'OraSage 为何这样做内容电商。'),
    },
  ];

  return (
    <PageShell hideBack className="max-w-4xl">
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          {t('Home', '首页')}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{t('Origins', '造物')}</span>
      </nav>

      <PageTitle>{t('Craft you can inspect.', '可被检视的工艺。')}</PageTitle>
      <PageLead>
        {t(
          'Origins explains materials, making, and story — without outcome claims. Full piece pages come when the piece is ready.',
          '造物讲述材料、工艺与缘起——不做结果承诺。完整单品页将在即将上线。',
        )}
      </PageLead>

      <Disclaimer variant="compact" locale={locale} className="mt-6" />

      <section className="mt-10 grid gap-4">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[var(--os-radius-card)] border border-border bg-card p-5 transition-colors hover:border-foreground/20"
          >
            <h2 className="font-serif text-lg font-medium text-foreground">{item.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
          </Link>
        ))}
      </section>

      <Disclaimer variant="product" locale={locale} className="mt-12" />
    </PageShell>
  );
}
