import { DailyFortuneFlow } from '@/components/daily-fortune/DailyFortuneFlow';
import '../tarot-home.css';

export const metadata = {
  title: '每日运势 · Manto',
  description: '工作、爱情、事业、财运四维运势解读',
};

export default function DailyFortunePage() {
  return <DailyFortuneFlow />;
}
