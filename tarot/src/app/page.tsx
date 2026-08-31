import type { Metadata } from "next"
import { TarotHomeV2 } from '@/components/home/TarotHomeV2';
import { resolveServerLang } from '@/lib/i18n/request-lang';
import { siteMetadataForLang } from '@/lib/i18n/site-metadata';
import { tarotPageMeta } from '@/lib/seo-routes';
import './tarot-home.css';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await resolveServerLang();
  const meta = siteMetadataForLang(lang);
  return tarotPageMeta('/', meta.title, meta.description);
}

export default function TarotHomePage() {
  return <TarotHomeV2 />;
}
