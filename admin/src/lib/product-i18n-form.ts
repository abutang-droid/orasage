const LOCALE_CODES = ['zh-CN', 'zh-TW', 'en', 'pt-BR'] as const;

export type I18nFormPrefix =
  | 'name_i18n'
  | 'description_i18n'
  | 'material_i18n'
  | 'color_i18n'
  | 'packaging_i18n';

export function parseI18nMapFromForm(
  formData: FormData,
  prefix: I18nFormPrefix,
): Record<string, string> | null {
  const map: Record<string, string> = {};
  for (const code of LOCALE_CODES) {
    const value = String(formData.get(`${prefix}_${code}`) ?? '').trim();
    if (value) map[code] = value;
  }
  return Object.keys(map).length > 0 ? map : null;
}
