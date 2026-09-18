/** 全站子域入口 — 同步自 shared/app-shell/config.ts（主源） */
export const ORASAGE_URLS = {
  main: 'https://orasage.com',
  bazi: 'https://bazi.orasage.com',
  ziwei: 'https://ziwei.orasage.com',
  tarot: 'https://tarot.orasage.com',
  shop: 'https://shop.orasage.com',
  temple: 'https://tarot.orasage.com/temple',
} as const;

export function famousUrl(locale = 'zh-CN'): string {
  return `${ORASAGE_URLS.main}/${locale}/famous`;
}

export function daozangUrl(locale = 'zh-CN'): string {
  return `${ORASAGE_URLS.main}/${locale}/daozang`;
}

/**
 * auth-service 基址。生产为 https://auth.orasage.com；
 * 本地联调可用 EXPO_PUBLIC_AUTH_URL=http://127.0.0.1:3101 覆盖。
 */
export const AUTH_BASE_URL =
  process.env.EXPO_PUBLIC_AUTH_URL ?? 'https://auth.orasage.com';
