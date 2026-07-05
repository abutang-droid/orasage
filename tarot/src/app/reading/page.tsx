import { ThreeCardFlow } from '@/components/three-card/ThreeCardFlow';
import '../tarot-home.css';

export const metadata = {
  title: '三牌阵 · Manto',
  description: '过去、现在、未来三牌阵占卜，简读免费，完整详读付费解锁',
};

export default function ReadingPage() {
  return <ThreeCardFlow />;
}
