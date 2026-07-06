export const OCCUPATION_OPTIONS = ['工作', '待业', '学生', '自由职业'] as const;
export type OccupationOption = (typeof OCCUPATION_OPTIONS)[number];

export const GENDER_OPTIONS = ['女', '男', '非二元', '不想说'] as const;
export type GenderOption = (typeof GENDER_OPTIONS)[number];

export type OnboardingDraft = {
  nickname: string;
  birthdate: string;
  gender: GenderOption | '';
  occupation: OccupationOption | '';
  faith: string;
  countryCode: string;
  continentCode: string;
};

export type OnboardingPrefill = {
  nickname: string;
  birthdate: string;
  gender: GenderOption | '';
  occupation: OccupationOption | '';
  faith: string;
  countryCode: string;
  continentCode: string;
  sourceApp: string | null;
  sourceLabel: string | null;
};

export function normalizeNickname(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed || trimmed === '旅人') return '';
  return trimmed;
}

export function formatPrefillSummary(prefill: OnboardingPrefill): string {
  const rows: string[] = [];
  if (prefill.birthdate) rows.push(`生日：${prefill.birthdate}`);
  if (prefill.gender) rows.push(`性别：${prefill.gender}`);
  if (prefill.occupation) rows.push(`工作状态：${prefill.occupation}`);
  if (prefill.faith) rows.push(`信仰：${prefill.faith}`);
  if (prefill.countryCode) rows.push(`国家/地区：${prefill.countryCode}`);
  if (prefill.sourceLabel) rows.push(`来源：${prefill.sourceLabel} 档案`);
  return rows.join('\n');
}

export function genderToAuth(gender: GenderOption | ''): 'male' | 'female' | null {
  if (gender === '男') return 'male';
  if (gender === '女') return 'female';
  return null;
}

export function genderFromAuth(gender: string | null | undefined): GenderOption | '' {
  if (gender === 'male' || gender === '男') return '男';
  if (gender === 'female' || gender === '女') return '女';
  return '';
}

export function birthFromParts(
  year?: string | null,
  month?: string | null,
  day?: string | null,
): string {
  if (!year || !month || !day) return '';
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function hasPrefillData(prefill: Partial<OnboardingPrefill>): boolean {
  return Boolean(
    prefill.birthdate || prefill.gender || prefill.occupation || prefill.faith || prefill.countryCode,
  );
}

export const SOURCE_APP_LABELS: Record<string, string> = {
  bazi: '八字',
  ziwei: '紫微',
  tarot: '塔罗',
};
