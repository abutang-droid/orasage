import type { Metadata } from 'next';
import { tarotPageMeta } from '@/lib/seo-routes';

export const metadata: Metadata = tarotPageMeta(
  '/wish',
  'Wish & Blessing',
  'Make a wish and receive a blessing',
);

export default function WishLayout({ children }: { children: React.ReactNode }) {
  return children;
}
