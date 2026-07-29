import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import './globals.css';
import { LocaleProvider } from '@/lib/i18n';
import { CityProviderShell } from '@/components/CityProviderShell';
import { OraSageAppShell } from '@/components/OraSageAppShell';
import { HtmlLangSync } from '@/components/HtmlLangSync';
import { buildOrasageMetadata, ORASAGE_URLS } from '@/lib/orasage-seo';
import { detectLocale, LOCALE_COOKIE, LOCALE_OVERRIDE_COOKIE } from '@orasage/i18n';

const META = {
  'zh-CN': {
    title: '紫微斗数排盘',
    description: '基于倪海夏正宗紫微斗数体系，AI 深度解读命盘格局、大限流年、感情事业财富健康全方位解析。',
    ogDescription: '东方命理 × 现代心理学 · AI 深度解读您的紫微命盘',
  },
  en: {
    title: 'Zi Wei Dou Shu Chart',
    description: 'Classical Zi Wei Dou Shu with AI readings — natal chart, decade cycles, love, career, wealth, and health.',
    ogDescription: 'Eastern metaphysics × modern psychology · AI reading of your Zi Wei chart',
  },
  'pt-BR': {
    title: 'Mapa Zi Wei Dou Shu',
    description: 'Zi Wei Dou Shu clássico com leitura por IA — mapa natal, ciclos, amor, carreira, riqueza e saúde.',
    ogDescription: 'Metafísica oriental × psicologia moderna · leitura IA do seu mapa Zi Wei',
  },
} as const;

async function resolveZiweiLocale(): Promise<keyof typeof META> {
  const jar = await cookies();
  const hdrs = await headers();
  const query =
    hdrs.get('x-orasage-locale') ??
    (() => {
      for (const raw of [hdrs.get('x-url'), hdrs.get('next-url'), hdrs.get('referer')]) {
        if (!raw) continue;
        try {
          const url = raw.startsWith('http') ? new URL(raw) : new URL(raw, 'http://localhost');
          return url.searchParams.get('lang') ?? url.searchParams.get('locale');
        } catch {
          /* ignore */
        }
      }
      return null;
    })();
  const locale = detectLocale({
    queryLocale: query,
    cookieLocale: jar.get(LOCALE_OVERRIDE_COOKIE)?.value ?? jar.get(LOCALE_COOKIE)?.value,
    acceptLanguage: hdrs.get('accept-language'),
  });
  if (locale in META) return locale as keyof typeof META;
  return 'zh-CN';
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveZiweiLocale();
  const copy = META[locale];
  return buildOrasageMetadata({
    title: copy.title,
    description: copy.description,
    keywords: 'Zi Wei, 紫微斗数, 倪海夏, 命盘, 命理, AI解读, 紫微排盘, 合盘, OraSage',
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || ORASAGE_URLS.ziwei),
    canonical: '/',
    openGraph: {
      title: copy.title,
      description: copy.ogDescription,
      url: ORASAGE_URLS.ziwei,
      locale: locale.replace('-', '_'),
    },
    ogImage: `${ORASAGE_URLS.ziwei}/og.png`,
  });
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await resolveZiweiLocale();
  return (
    <html lang={locale} data-theme="light" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body className="min-h-screen" style={{ background: 'var(--bg-0)', color: 'var(--tx-1)' }}>
        <LocaleProvider>
          <HtmlLangSync />
          <CityProviderShell>
            <OraSageAppShell>{children}</OraSageAppShell>
          </CityProviderShell>
        </LocaleProvider>
      </body>
    </html>
  );
}
