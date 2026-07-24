import { SEED_SANCTUARIES } from '../../../../shared/tarot-faith-seed';

export type Deity = {
  id: string;
  name: string;
  nameEN: string;
  namePt?: string;
  nameEs?: string;
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
  namePt: s.namePt ?? s.nameEn,
  nameEs: s.nameEs ?? s.nameEn,
  tradition: s.tradition === 'latin' ? 'latin' : 'seasia',
  region: s.region,
  domains: s.domains,
  color: s.color,
  gradient: s.gradient,
  imageUrl: s.imageUrl,
  faithIds: s.faithCodes,
}));

const SEED_BY_CODE = new Map(SEED_SANCTUARIES.map((s) => [s.code, s]));

/** Merge PT/ES names from seed when CMS has not been migrated yet. */
export function localizedNamesForCode(code: string): { namePt?: string; nameEs?: string } {
  const seed = SEED_BY_CODE.get(code);
  if (!seed) return {};
  return {
    namePt: seed.namePt ?? seed.nameEn,
    nameEs: seed.nameEs ?? seed.nameEn,
  };
}

export function filterDeitiesByFaith(faithId: string | null): Deity[] {
  if (!faithId || faithId === 'none' || faithId.startsWith('other')) {
    return DEITIES;
  }
  const matched = DEITIES.filter((d) => d.faithIds.includes(faithId));
  return matched.length > 0 ? matched : DEITIES;
}
