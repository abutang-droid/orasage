import { SingleCardFlow } from '@/components/single-card/SingleCardFlow';
import '../tarot-home.css';

export const metadata = {
  title: '单牌阵 · Manto',
  description: '心中默念问题，随机抽取一张牌，免费简读，完整详读付费解锁',
};

export default function SingleCardPage() {
  return <SingleCardFlow />;
}
