import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import './globals.css';
import { LocaleProvider, type Locale } from '@/lib/i18n';
import { CityProviderShell } from '@/components/CityProviderShell';
import { OraSageAppShell } from '@/components/OraSageAppShell';
import { ORASAGE_URLS } from '@/lib/orasage-seo';
import { CORE_LOCALES, detectLocale, LOCALE_COOKIE, LOCALE_OVERRIDE_COOKIE } from '@orasage/i18n';
import { isChineseLocale, siteDisplayName, titleTemplate } from '@/lib/orasage-app-shell/brand';

const PAGE_TITLE_ZH = '紫微斗数排盘';
const PAGE_TITLE_EN = 'Zi Wei Dou Shu';
const PAGE_DESCRIPTION_ZH = '基于倪海夏正宗紫微斗数体系，AI 深度解读命盘格局、大限流年、感情事业财富健康全方位解析。';
const PAGE_DESCRIPTION_EN = 'Zi Wei Dou Shu charts with structured readings — for cultural reference, not fortune-telling.';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveInitialLocale();
  const zh = isChineseLocale(locale);
  const title = zh ? PAGE_TITLE_ZH : PAGE_TITLE_EN;
  const description = zh ? PAGE_DESCRIPTION_ZH : PAGE_DESCRIPTION_EN;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || ORASAGE_URLS.ziwei),
    title: {
      default: title,
      template: titleTemplate(locale),
    },
    description,
    keywords: zh
      ? '紫微斗数, 倪海夏, 命盘, 命理, 海棠未眠, OraSage'
      : 'Zi Wei Dou Shu, natal chart, OraSage',
    openGraph: {
      siteName: siteDisplayName(locale),
      title,
      description,
      url: ORASAGE_URLS.ziwei,
      locale: locale.replace('-', '_'),
      images: [{ url: `${ORASAGE_URLS.ziwei}/og.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${ORASAGE_URLS.ziwei}/og.png`],
    },
  };
}

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
