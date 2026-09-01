import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { PageShell, PageTitle } from '@/components/PageShell';
import { buildPortalPageMeta } from '@/lib/seo';
import { Disclaimer } from '@/lib/orasage-app-shell/Disclaimer';

import { Card, CardContent } from '@orasage/ui';
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });
  return buildPortalPageMeta({
    locale,
    pathname: '/faq',
    title: t('title'),
  });
}

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
          <Card key={n}>
            <CardContent className="p-5 sm:p-6">
              <h2 className="text-base font-medium leading-snug text-foreground sm:text-lg">{t(`q${n}`)}</h2>
              <p className="mt-2 break-words text-[15px] leading-relaxed text-muted-foreground">
                {t(`a${n}`)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Disclaimer variant="standard" locale={locale} className="mt-8" />
    </PageShell>
  );
}
