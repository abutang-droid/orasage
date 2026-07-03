import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/navigation';
import { Header } from '@/components/Header';
import { ConditionalFooter } from '@/components/ConditionalFooter';
import { PortalChrome } from '@/components/PortalChrome';
import { ORASAGE_URLS, orasageOpenGraph, orasageTwitter } from '@/lib/orasage-seo';
import type { Metadata, Viewport } from 'next';
import './globals.css';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`../../../messages/${locale}.json`)).default;
  const title = messages.meta.title as string;
  const description = messages.meta.description as string;
  const keywords = (messages.meta.keywords as string | undefined)
    ?? 'OraSage, divination, BaZi, Zi Wei, tarot, crystal energy';

  return {
    metadataBase: new URL(ORASAGE_URLS.main),
    title,
    description,
    keywords: keywords.split(',').map((k: string) => k.trim()),
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, `/${loc}`]),
      ),
    },
    openGraph: orasageOpenGraph({
      title,
      description,
      url: `${ORASAGE_URLS.main}/${locale}`,
      locale: locale.replace('-', '_'),
    }),
    twitter: orasageTwitter(title, description),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <PortalChrome locale={locale}>{children}</PortalChrome>
          <ConditionalFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
