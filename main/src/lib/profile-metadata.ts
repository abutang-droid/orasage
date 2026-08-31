import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildPortalPageMeta } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function buildPrivateProfileMetadata(
  params: Promise<{ locale: string }>,
  pathname: string,
  titleKey: string,
  namespace = 'profile',
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace });
  return buildPortalPageMeta({
    locale,
    pathname,
    title: t(titleKey),
    noindex: true,
  });
}

export { setRequestLocale };
