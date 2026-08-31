import type { Metadata } from 'next';
import { tarotPageMeta } from '@/lib/seo-routes';

export const metadata: Metadata = tarotPageMeta(
  '/dream',
  'Dream Interpretation',
  'Tarot-assisted dream analysis',
);

export default function DreamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
