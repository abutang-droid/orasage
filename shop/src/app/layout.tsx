import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '能量商城 — OraSage',
  description: '命理解读推荐 · 水晶手串 · 数字报告',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#fafaf8',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-dvh bg-sage-bg text-sage-primary antialiased">{children}</body>
    </html>
  );
}
