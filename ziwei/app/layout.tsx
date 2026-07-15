import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { Noto_Sans_SC, Noto_Serif_SC } from 'next/font/google';
import './globals.css';
import { LocaleProvider } from '@/lib/i18n';
import { CityProviderShell } from '@/components/CityProviderShell';
import { OraSageAppShell } from '@/components/OraSageAppShell';
import { buildOrasageMetadata, ORASAGE_URLS } from '@/lib/orasage-seo';
import { detectLocale, LOCALE_COOKIE, LOCALE_OVERRIDE_COOKIE } from '@orasage/i18n';

const notoSans = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-ziwei-sans',
  display: 'swap',
});

const notoSerif = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ziwei-serif',
  display: 'swap',
});

const PAGE_TITLE = '紫微斗数排盘';
const PAGE_DESCRIPTION = '基于倪海夏正宗紫微斗数体系，AI 深度解读命盘格局、大限流年、感情事业财富健康全方位解析。';

export const metadata: Metadata = buildOrasageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: '紫微斗数, 倪海夏, 命盘, 命理, AI解读, 紫微排盘, 合盘, OraSage',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || ORASAGE_URLS.ziwei),
  canonical: '/',
  openGraph: {
    title: PAGE_TITLE,
    description: '东方命理 × 现代心理学 · AI 深度解读您的紫微命盘',
    url: ORASAGE_URLS.ziwei,
    locale: 'zh_CN',
  },
  ogImage: `${ORASAGE_URLS.ziwei}/og.png`,
});

async function resolveHtmlLang(): Promise<string> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  return detectLocale({
    cookieLocale:
      cookieStore.get(LOCALE_OVERRIDE_COOKIE)?.value
      ?? cookieStore.get(LOCALE_COOKIE)?.value
      ?? null,
    acceptLanguage: headerStore.get('accept-language'),
  });
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await resolveHtmlLang();

  return (
    <html
      lang={lang}
      data-theme="light"
      suppressHydrationWarning
      className={`${notoSans.variable} ${notoSerif.variable}`}
    >
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body className="min-h-screen" style={{ background: 'var(--bg-0)', color: 'var(--tx-1)' }}>
        <LocaleProvider>
          <CityProviderShell>
            <OraSageAppShell>{children}</OraSageAppShell>
          </CityProviderShell>
        </LocaleProvider>
      </body>
    </html>
  );
}
