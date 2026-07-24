/** Map UI short lang codes to AI request `language` field. */
export function aiLangBody(lang: string): { language: string } {
  if (lang === 'en' || lang === 'en-US') return { language: 'en' };
  if (lang === 'pt' || lang === 'pt-BR') return { language: 'pt-BR' };
  if (lang === 'es') return { language: 'en' };
  if (lang === 'zh-TW' || lang === 'zh-HK') return { language: 'zh-TW' };
  return { language: 'zh-CN' };
}
