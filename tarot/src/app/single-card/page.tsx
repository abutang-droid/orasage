import { SingleCardFlow } from '@/components/single-card/SingleCardFlow';
import '../tarot-home.css';

export const metadata = {
  title: '单牌占卜 · Manto',
  description: '写下明确问题，抽牌获得是/否方向的启示',
};

export default function SingleCardPage() {
  return <SingleCardFlow />;
}
