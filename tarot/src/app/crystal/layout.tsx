import type { Metadata } from 'next';
import { tarotPageMeta } from '@/lib/seo-routes';

export const metadata: Metadata = tarotPageMeta(
  '/crystal',
  'Crystal Recommendations',
  'Elemental crystal matches from your reading',
);

export default function CrystalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
