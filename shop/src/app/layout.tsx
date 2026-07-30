import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import './globals.css';
import { ShopShell } from '@/components/ShopShell';
import { buildOrasageMetadata, ORASAGE_URLS } from '@/lib/orasage-seo';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#fafaf8',
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations('meta');
  const title = t('title');
  const description = t('description');
  const ogLocale = locale.replace('-', '_');

  return buildOrasageMetadata({
    title,
    description,
    keywords: ['OraSage', 'energy shop', 'crystal bracelet', 'divination report', '能量商城', '水晶手串'],
    metadataBase: new URL(ORASAGE_URLS.shop),
    canonical: '/',
    openGraph: {
      title,
      description,
      url: ORASAGE_URLS.shop,
      locale: ogLocale,
    },
    ogImage: `${ORASAGE_URLS.shop}/og.png`,
  });
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-dvh bg-sage-bg text-sage-primary antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ShopShell>{children}</ShopShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
