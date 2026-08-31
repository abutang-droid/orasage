import type { Metadata } from 'next';
import { DailyFortuneFlow } from '@/components/daily-fortune/DailyFortuneFlow';
import { tarotPageMeta } from '@/lib/seo-routes';
import '../tarot-home.css';

export const metadata: Metadata = tarotPageMeta(
  '/daily-fortune',
  'Daily Fortune',
  'Work, love, career, and wealth readings',
);

export default function DailyFortunePage() {
  return <DailyFortuneFlow />;
}
