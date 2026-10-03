import type { Metadata } from 'next';
import { ORASAGE_URLS } from '@/lib/orasage-seo';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || ORASAGE_URLS.ziwei;

/** Title suffix comes from root layout template (locale-aware 海棠未眠 / OraSage). */
export const metadata: Metadata = {
  title: '紫微斗数排盘',
  description: '基于倪海夏正宗紫微斗数体系，AI 深度解读命盘格局、大限流年。',
  alternates: { canonical: `${BASE}/chart` },
};

export default function ChartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
