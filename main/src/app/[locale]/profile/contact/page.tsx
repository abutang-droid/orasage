import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LegacyHtmlArticle } from '@/components/LegacyHtmlArticle';
import { ContactForm } from '@/components/profile/ContactForm';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { fetchCmsPageBySlug } from '@/lib/cms';
import { buildPortalPageMeta } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'profile.contact' });
  return buildPortalPageMeta({
    locale,
    pathname: '/profile/contact',
    title: t('title'),
    description: t('desc'),
  });
}

/** 联系我们 — CMS 简介（可选）+ 留言表单（工单入 admin 后台） */
export default async function ProfileContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile.contact');

  const page = await fetchCmsPageBySlug('legal/contact').catch(() => null);
  const intro = page?.appSource === 'main' ? page.legacyHtml?.trim() : undefined;

  return (
    <ProfileSection title={t('title')} description={t('desc')}>
      {intro ? <LegacyHtmlArticle html={intro} className="portal-subpage-body legal-article" /> : null}
      <ContactForm />
    </ProfileSection>
  );
}
