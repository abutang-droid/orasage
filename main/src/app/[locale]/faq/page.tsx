import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageShell, PageTitle } from '@/components/PageShell';

type Props = { params: Promise<{ locale: string }> };

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('faq');
  const items = [1, 2, 3] as const;

  return (
    <PageShell>
      <PageTitle>{t('title')}</PageTitle>
      <div className="mt-5 space-y-4 sm:mt-8 sm:space-y-6">
        {items.map((n) => (
          <div
            key={n}
            className="rounded-xl border border-sage-border bg-sage-card/60 p-4 sm:p-6"
          >
            <h2 className="text-base font-medium text-white sm:text-lg">{t(`q${n}`)}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-sage-muted sm:text-sm">
              {t(`a${n}`)}
            </p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
