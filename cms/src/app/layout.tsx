import React from 'react';
import type { Metadata } from 'next';
import './platform-shell.css';

export const metadata: Metadata = {
  applicationName: 'OraSage 内容',
  appleWebApp: { capable: true, title: '内容', statusBarStyle: 'default' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
