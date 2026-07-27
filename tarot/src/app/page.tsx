import { TarotHomeV2 } from '@/components/home/TarotHomeV2';
import { loadTarotHomeHero } from '@/lib/cms-tarot-hero';
import { resolveServerLang } from '@/lib/i18n/request-lang';
import './tarot-home.css';

export default async function TarotHomePage() {
  const lang = await resolveServerLang();
  const initialHero = await loadTarotHomeHero(lang);
  return <TarotHomeV2 initialHero={initialHero} />;
}
