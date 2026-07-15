import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter, Noto_Sans_SC, Noto_Serif_SC } from 'next/font/google';
import { routing } from '@/i18n/navigation';
import { Header } from '@/components/Header';
import { ConditionalFooter } from '@/components/ConditionalFooter';
import { PortalChrome } from '@/components/PortalChrome';
import { AnalyticsPageView } from '@/components/AnalyticsPageView';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { ORASAGE_URLS, orasageOpenGraph, orasageTwitter } from '@/lib/orasage-seo';
import type { Metadata, Viewport } from 'next';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-orasage-inter',
  weight: ['400', '500', '600', '700'],
});

const notoSansSc = Noto_Sans_SC({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-orasage-sans-sc',
  weight: ['400', '500', '700'],
});

const notoSerifSc = Noto_Serif_SC({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-orasage-serif-sc',
  weight: ['400', '700'],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#fafaf8',
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
      image: `${ORASAGE_URLS.main}/og.png`,
    }),
    twitter: orasageTwitter(title, description, `${ORASAGE_URLS.main}/og.png`),
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
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className={`${inter.variable} ${notoSansSc.variable} ${notoSerifSc.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased">
        <NextIntlClientProvider messages={messages}>
          <AnalyticsPageView locale={locale} />
          <LiveChatWidget />
          <Header />
          <PortalChrome locale={locale}>{children}</PortalChrome>
          <ConditionalFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
