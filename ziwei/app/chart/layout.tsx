import type { Metadata } from 'next';
import { buildOrasageMetadata, ORASAGE_URLS } from '@/lib/orasage-seo';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || ORASAGE_URLS.ziwei;

export const metadata: Metadata = buildOrasageMetadata({
  title: '紫微斗数排盘',
  description: '基于倪海夏正宗紫微斗数体系，AI 深度解读命盘格局、大限流年。',
  canonical: `${BASE}/chart`,
});

export default function ChartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
