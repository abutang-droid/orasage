import { SingleCardFlow } from '@/components/single-card/SingleCardFlow';
import '../tarot-home.css';

export const metadata = {
  title: '定命切片 // FOCUS · Manto',
  description: '单点高能聚焦。心中固化是非题，滑动牌堆抽取倾向性数据切片。',
};

export default function SingleCardPage() {
  return <SingleCardFlow />;
}
