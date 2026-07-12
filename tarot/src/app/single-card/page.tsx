import { SingleCardFlow } from '@/components/single-card/SingleCardFlow';
import '../tarot-home.css';

export const metadata = {
  title: '定命切片 · Manto',
  description: '面临抉择？免费抽牌，付费一次永久解锁行动指引',
};

export default function SingleCardPage() {
  return <SingleCardFlow />;
}
