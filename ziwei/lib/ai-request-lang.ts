/** Map ziwei UI locale to AI request language field. */
export function aiRequestLanguage(locale: string): string {
  if (locale === 'en') return 'en';
  if (locale === 'pt-BR') return 'pt-BR';
  if (locale === 'zh-TW') return 'zh-TW';
  return 'zh-CN';
}
