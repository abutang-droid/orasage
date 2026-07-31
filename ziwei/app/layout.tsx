import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import './globals.css';
import { LocaleProvider, type Locale } from '@/lib/i18n';
import { CityProviderShell } from '@/components/CityProviderShell';
import { OraSageAppShell } from '@/components/OraSageAppShell';
import { buildOrasageMetadata, ORASAGE_URLS } from '@/lib/orasage-seo';
import { CORE_LOCALES, detectLocale, LOCALE_COOKIE, LOCALE_OVERRIDE_COOKIE } from '@orasage/i18n';

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

async function resolveInitialLocale(): Promise<Locale> {
  const jar = await cookies();
  const hdrs = await headers();
  const url = hdrs.get('x-url') || hdrs.get('x-forwarded-url') || '';
  let queryLang: string | null = null;
  try {
    if (url) queryLang = new URL(url).searchParams.get('lang');
  } catch {
    /* ignore */
  }
  // Next may not forward full URL; also check referer query as weak fallback.
  if (!queryLang) {
    const referer = hdrs.get('referer') || '';
    try {
      if (referer) queryLang = new URL(referer).searchParams.get('lang');
    } catch {
      /* ignore */
    }
  }
  const locale = detectLocale({
    queryLocale: queryLang,
    cookieLocale:
      jar.get(LOCALE_OVERRIDE_COOKIE)?.value ?? jar.get(LOCALE_COOKIE)?.value,
    acceptLanguage: hdrs.get('accept-language'),
  });
  return ((CORE_LOCALES as readonly string[]).includes(locale) ? locale : 'zh-CN') as Locale;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await resolveInitialLocale();

  return (
    <html lang={locale} data-theme="light" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body className="min-h-screen" style={{ background: 'var(--bg-0)', color: 'var(--tx-1)' }}>
        <LocaleProvider initialLocale={locale}>
          <CityProviderShell>
            <OraSageAppShell>{children}</OraSageAppShell>
          </CityProviderShell>
        </LocaleProvider>
      </body>
    </html>
  );
}
