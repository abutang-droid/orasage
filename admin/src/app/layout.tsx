import type { Metadata } from 'next';
import './globals.css';
import { AdminShell } from '@/components/AdminShell';

export const metadata: Metadata = {
  title: 'OraSage 管理后台',
  description: 'OraSage 运营管理后台',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-theme="light">
      <body className="orasage-app-shell" data-theme="light" style={{ background: 'var(--orasage-background, #fafaf8)', color: 'var(--orasage-primary, #171717)' }}>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
