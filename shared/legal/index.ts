/** 全站法律协议类型与公开路径（CMS legal-agreements.kind） */
export const LEGAL_AGREEMENT_KINDS = ['privacy', 'service', 'product'] as const;
export type LegalAgreementKind = (typeof LEGAL_AGREEMENT_KINDS)[number];

/** 注册/付费勾选时写入用户或请求的默认版本号（与 CMS seed 对齐） */
export const LEGAL_AGREEMENT_VERSION_DEFAULT = '2026.07';

/** 主站公开路径（相对 locale 前缀） */
export const LEGAL_PATHS: Record<LegalAgreementKind, string> = {
  privacy: '/privacy',
  service: '/terms',
  product: '/product-agreement',
};

export const LEGAL_PROFILE_PATHS: Record<LegalAgreementKind, string> = {
  privacy: '/profile/privacy',
  service: '/profile/terms',
  product: '/profile/product-agreement',
};

export function isLegalAgreementKind(value: string | null | undefined): value is LegalAgreementKind {
  return LEGAL_AGREEMENT_KINDS.includes(value as LegalAgreementKind);
}

/** 语言回退：当前语 → zh-CN */
export function legalLocaleChain(locale: string): string[] {
  if (!locale || locale === 'zh-CN') return ['zh-CN'];
  if (locale === 'zh-TW' || locale === 'zh-HK') return [locale === 'zh-HK' ? 'zh-TW' : locale, 'zh-CN'];
  return [locale, 'zh-CN'];
}

export function mainLegalUrl(kind: LegalAgreementKind, locale = 'zh-CN'): string {
  const base = (
    process.env.NEXT_PUBLIC_MAIN_URL
    || process.env.MAIN_URL
    || 'https://orasage.com'
  ).replace(/\/$/, '');
  return `${base}/${locale}${LEGAL_PATHS[kind]}`;
}
