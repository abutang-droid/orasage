import type { Metadata } from 'next';
import { tarotPageMeta } from '@/lib/seo-routes';

export const metadata: Metadata = tarotPageMeta(
  '/angel-card',
  'Angel Card',
  'Angel card guidance reading',
);

export default function AngelCardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
