import type { ZiweiChatQuota } from '@/lib/ziwei-chat-client';

export function formatZiweiQuotaLabel(quota: ZiweiChatQuota | null, loggedIn: boolean): string {
  if (!loggedIn) return '登录后赠送 5 次免费对话';
  if (!quota) return '加载额度…';
  if (quota.yearlyActive) return '年卡有效 · 无限问答';

  const freeExhausted = quota.freeRemaining <= 0;

  if (freeExhausted && quota.packCredits > 0) {
    return `剩余 ${quota.packCredits} 次对话`;
  }

  const parts: string[] = [];
  if (quota.freeRemaining > 0) {
    parts.push(`本盘免费 ${quota.freeRemaining}/${quota.freePerReading}`);
  }
  if (quota.packCredits > 0) {
    parts.push(`加量包 ${quota.packCredits} 次`);
  }
  if (parts.length === 0) return '问答次数已用完';
  return parts.join(' · ');
}
