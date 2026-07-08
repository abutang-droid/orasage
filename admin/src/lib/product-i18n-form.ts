const LOCALE_CODES = ['zh-CN', 'zh-TW', 'en', 'pt-BR'] as const;

export function parseI18nMapFromForm(
  formData: FormData,
  prefix: 'name_i18n' | 'description_i18n',
): Record<string, string> | null {
  const map: Record<string, string> = {};
  for (const code of LOCALE_CODES) {
    const value = String(formData.get(`${prefix}_${code}`) ?? '').trim();
    if (value) map[code] = value;
  }
  return Object.keys(map).length > 0 ? map : null;
}
