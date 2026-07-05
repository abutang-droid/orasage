import { OnboardingFlow } from '@/components/OnboardingFlow';
import './onboarding.css';

export const metadata = {
  title: '认识你 · Manto',
  description: '塔罗新手引导',
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
