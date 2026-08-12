import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LegacyHtmlArticle } from '@/components/LegacyHtmlArticle';
import { PageShell, PageTitle, PageLead } from '@/components/PageShell';
import { ContactForm } from '@/components/profile/ContactForm';
import { ProfileAuthProvider } from '@/components/profile/ProfileAuth';
import { fetchCmsPageBySlug } from '@/lib/cms';
import { LEGAL_CMS_SLUGS } from '@/lib/public-policies';

type Props = { params: Promise<{ locale: string }> };

/** 公开联系我们 — 游客可查看与留言（未登录可见） */
export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile.contact');
  const tProfile = await getTranslations('profile');

  const page = await fetchCmsPageBySlug(LEGAL_CMS_SLUGS.contact).catch(() => null);
  const intro = page?.appSource === 'main' ? page.legacyHtml?.trim() : undefined;

  return (
    <PageShell>
      <PageTitle>{t('title')}</PageTitle>
      <PageLead>{t('desc')}</PageLead>
      {intro ? (
        <LegacyHtmlArticle html={intro} className="portal-subpage-body legal-article mt-5 sm:mt-6" />
      ) : null}
      <div className="mt-6 sm:mt-8">
        <ProfileAuthProvider loadingLabel={tProfile('loading')}>
          <ContactForm />
        </ProfileAuthProvider>
      </div>
    </PageShell>
  );
}
