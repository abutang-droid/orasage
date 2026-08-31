import type { Metadata } from 'next';
import { tarotPageMeta } from '@/lib/seo-routes';

export const metadata: Metadata = tarotPageMeta(
  '/temple',
  'Daily Temple',
  'Daily worship and blessing rituals',
);

export default function TempleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
