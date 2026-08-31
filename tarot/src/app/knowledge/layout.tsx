import type { Metadata } from 'next';
import { tarotPageMeta } from '@/lib/seo-routes';

export const metadata: Metadata = tarotPageMeta(
  '/knowledge',
  'Tarot Knowledge',
  'Learn tarot symbolism and practice',
);

export default function KnowledgeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
