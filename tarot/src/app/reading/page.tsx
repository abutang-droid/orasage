import { ThreeCardFlow } from '@/components/three-card/ThreeCardFlow';
import '../tarot-home.css';

export const metadata = {
  title: '脉络解构 // TRILOGY · Manto',
  description: '多维数据链条。依次翻开过去·现在·未来三帧切片，免费字面释义，付费解锁链路推演。',
};

export default function ReadingPage() {
  return <ThreeCardFlow />;
}
