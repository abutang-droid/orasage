/** 单主题最大字符数（约 400–500 token） */
export const DEFAULT_MAX_TOPIC_CHARS = 800;

/** 整段样本上下文上限（防止撑爆 system prompt） */
export const DEFAULT_MAX_CONTEXT_CHARS = 6000;

export function truncateText(text: string, maxChars: number): string {
  const t = text.trim();
  if (!t || maxChars <= 0) return '';
  if (t.length <= maxChars) return t;
  if (maxChars <= 1) return '…';
  return `${t.slice(0, maxChars - 1)}…`;
}

/** 从末尾裁掉整块，直到总长度低于上限 */
export function limitTotalLength(text: string, maxChars: number): string {
  const t = text.trim();
  if (t.length <= maxChars) return t;
  const cut = t.slice(0, maxChars);
  const lastBreak = Math.max(cut.lastIndexOf('\n\n'), cut.lastIndexOf('\n'));
  if (lastBreak > maxChars * 0.5) return `${cut.slice(0, lastBreak)}\n…（已截断）`;
  return `${cut}…`;
}
