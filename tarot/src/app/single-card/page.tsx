import type { Metadata } from 'next';
import { SingleCardFlow } from '@/components/single-card/SingleCardFlow';
import { tarotPageMeta } from '@/lib/seo-routes';
import '../tarot-home.css';

export const metadata: Metadata = tarotPageMeta(
  '/single-card',
  'Single Card Reading',
  'Quick single-card tarot guidance',
);

export default function SingleCardPage() {
  return <SingleCardFlow />;
}
