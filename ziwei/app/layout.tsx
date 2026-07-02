import type { Metadata } from 'next';
import './globals.css';
import { LocaleProvider } from '@/lib/i18n';
import { OraSageAppShell } from '@/components/OraSageAppShell';

export const metadata: Metadata = {
  title: '紫微斗数排盘 · OraSage',
  description: '基于倪海夏正宗紫微斗数体系，AI 深度解读命盘格局、大限流年、感情事业财富健康全方位解析。OraSage 东方命理 × 现代心理学。',
  keywords: '紫微斗数, 倪海夏, 命盘, 命理, AI解读, 紫微排盘, 合盘, OraSage',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://wdyziweidoushu666.com'),
  alternates: { canonical: '/' },
  openGraph: {
    title: '紫微斗数排盘 · OraSage',
    description: '东方命理 × 现代心理学 · AI 深度解读您的紫微命盘',
    locale: 'zh_CN',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-theme="light" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body className="min-h-screen" style={{ background: 'var(--bg-0)', color: 'var(--tx-1)' }}>
        <LocaleProvider>
          <OraSageAppShell>{children}</OraSageAppShell>
        </LocaleProvider>
      </body>
    </html>
  );
}
