import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArticleTitle, LegacyHtmlArticle } from '@/components/LegacyHtmlArticle';
import { fetchCmsPageBySlug } from '@/lib/cms';

type Props = {
  params: Promise<{ locale: string }>;
  slug: string;
  titleKey: string;
};

export async function ProfileLegalPage({ params, slug, titleKey }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile.legal');

  const page = await fetchCmsPageBySlug(slug);
  if (!page || page.appSource !== 'main') notFound();

  const legacyHtml = page.legacyHtml?.trim();

  return (
    <div>
      <h2 className="font-serif text-xl text-sage-gold">
        <ArticleTitle>{page.title || t(titleKey)}</ArticleTitle>
      </h2>
      <div className="mt-6">
        {legacyHtml ? (
          <LegacyHtmlArticle html={legacyHtml} />
        ) : (
          <p className="text-sage-muted">{t('noBody')}</p>
        )}
      </div>
    </div>
  );
}
