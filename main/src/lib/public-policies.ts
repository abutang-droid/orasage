/** 主站公开公共政策路径（未登录可见；CMS slug 见 LEGAL_CMS_SLUGS） */
export const PUBLIC_POLICY_KEYS = ['privacy', 'terms', 'shipping', 'returns', 'contact'] as const;
export type PublicPolicyKey = (typeof PUBLIC_POLICY_KEYS)[number];

export const PUBLIC_POLICY_PATHS: Record<PublicPolicyKey, string> = {
  privacy: '/privacy',
  terms: '/terms',
  shipping: '/shipping',
  returns: '/returns',
  contact: '/contact',
};

/** CMS Pages.slug（appSource=main） */
export const LEGAL_CMS_SLUGS: Record<PublicPolicyKey, string> = {
  privacy: 'legal/privacy',
  terms: 'legal/terms',
  shipping: 'legal/shipping',
  returns: 'legal/returns',
  contact: 'legal/contact',
};

export function isPublicPolicyPath(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  return PUBLIC_POLICY_KEYS.some((key) => PUBLIC_POLICY_PATHS[key] === p);
}
