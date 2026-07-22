import { ORASAGE_URLS } from '@/lib/orasage-app-shell/config';

/** 用户中心「占卜记录」页（main 门户 profile） */
export function profileReadingsUrl(locale = 'zh-CN'): string {
  const main =
    process.env.NEXT_PUBLIC_MAIN_URL ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/^https:\/\/tarot\./, 'https://') ||
    ORASAGE_URLS.main;
  return `${main.replace(/\/$/, '')}/${locale}/profile/readings`;
}
