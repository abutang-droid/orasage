import type { Metadata } from 'next';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { resolveServerLang } from '@/lib/i18n/request-lang';
import { onboardingMetadataForLang } from '@/lib/i18n/site-metadata';
import { tarotPageMeta } from '@/lib/seo-routes';
import './onboarding.css';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await resolveServerLang();
  const meta = onboardingMetadataForLang(lang);
  return tarotPageMeta('/onboarding', meta.title, meta.description);
}

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
