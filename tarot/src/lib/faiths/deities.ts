import { SEED_SANCTUARIES } from '../../../../shared/tarot-faith-seed';

export type Deity = {
  id: string;
  name: string;
  nameEN: string;
  tradition: 'latin' | 'seasia';
  region: string;
  domains: string[];
  color: string;
  gradient: string;
  imageUrl: string;
  faithIds: string[];
};

/** 与 CMS seed（shared/tarot-faith-seed）同步的本地 fallback 守护神列表 */
export const DEITIES: Deity[] = SEED_SANCTUARIES.map((s) => ({
  id: s.code,
  name: s.nameZh,
  nameEN: s.nameEn,
  tradition: s.tradition === 'latin' ? 'latin' : 'seasia',
  region: s.region,
  domains: s.domains,
  color: s.color,
  gradient: s.gradient,
  imageUrl: s.imageUrl,
  faithIds: s.faithCodes,
}));

export function filterDeitiesByFaith(faithId: string | null): Deity[] {
  if (!faithId || faithId === 'none' || faithId.startsWith('other')) {
    return DEITIES;
  }
  const matched = DEITIES.filter((d) => d.faithIds.includes(faithId));
  return matched.length > 0 ? matched : DEITIES;
}
