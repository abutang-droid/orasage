const MAIN_ORIGIN = process.env.NEXT_PUBLIC_MAIN_URL || 'https://orasage.com';

/** 用户中心「占卜记录」页（main 门户 profile） */
export function profileReadingsUrl(locale = 'zh-CN'): string {
  return `${MAIN_ORIGIN.replace(/\/$/, '')}/${locale}/profile/readings`;
}
