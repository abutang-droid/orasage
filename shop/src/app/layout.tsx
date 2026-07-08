import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import { ShopShell } from '@/components/ShopShell';
import { buildOrasageMetadata, ORASAGE_URLS } from '@/lib/orasage-seo';

const PAGE_TITLE = 'OraSage Energy Shop';
const PAGE_DESCRIPTION = 'Crystal bracelets, digital divination reports, and energy consultations — curated by OraSage.';

export const metadata: Metadata = buildOrasageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: ['OraSage', 'energy shop', 'crystal bracelet', 'divination report', '能量商城', '水晶手串'],
  metadataBase: new URL(ORASAGE_URLS.shop),
  canonical: '/',
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: ORASAGE_URLS.shop,
    locale: 'zh_CN',
  },
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#fafaf8',
};

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
