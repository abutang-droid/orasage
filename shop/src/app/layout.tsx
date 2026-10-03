import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import { ShopShell } from '@/components/ShopShell';
import { buildOrasageMetadata, ORASAGE_URLS } from '@/lib/orasage-seo';
import { isChineseLocale } from '@/lib/orasage-app-shell/brand';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const zh = isChineseLocale(locale);
  return buildOrasageMetadata({
    locale,
    title: zh ? '能量商城' : 'Crystal Shop',
    description: zh
      ? '水晶手串、数字报告与能量咨询 — 海棠未眠 OraSage。'
      : 'Crystal bracelets, digital divination reports, and energy consultations — curated by OraSage.',
    keywords: zh
      ? ['海棠未眠', 'OraSage', '水晶商城', '水晶手串']
      : ['OraSage', 'crystal shop', 'crystal bracelet', 'divination report'],
    metadataBase: new URL(ORASAGE_URLS.shop),
    openGraph: {
      title: zh ? '能量商城' : 'Crystal Shop',
      description: zh
        ? '水晶手串、数字报告与能量咨询 — 海棠未眠 OraSage。'
        : 'Crystal bracelets, digital divination reports, and energy consultations — curated by OraSage.',
      url: ORASAGE_URLS.shop,
      locale: locale.replace('-', '_'),
    },
    ogImage: `${ORASAGE_URLS.shop}/og.png`,
  });
}

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
