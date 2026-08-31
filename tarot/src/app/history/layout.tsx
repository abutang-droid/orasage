import type { Metadata } from 'next';
import { tarotPageMeta } from '@/lib/seo-routes';

export const metadata: Metadata = tarotPageMeta(
  '/history',
  'Reading History',
  'Your past tarot readings',
  { noindex: true },
);

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
