import type { Metadata } from 'next';
import { ThreeCardFlow } from '@/components/three-card/ThreeCardFlow';
import { tarotPageMeta } from '@/lib/seo-routes';
import '../tarot-home.css';

export const metadata: Metadata = tarotPageMeta(
  '/reading',
  'Three-Card Reading',
  'Past, present, and future tarot spread',
);

export default function ReadingPage() {
  return <ThreeCardFlow />;
}
