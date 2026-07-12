import { SingleCardFlow } from '@/components/single-card/SingleCardFlow';
import '../tarot-home.css';

export const metadata = {
  title: '定命切片 · Manto',
  description: '面临抉择不知如何选择？从牌堆抽一张，获得简洁行动指引。一次付费永久解锁。',
};

export default function SingleCardPage() {
  return <SingleCardFlow />;
}
