export function formatMoney(cents: number, currency = 'USDT'): string {
  const upper = currency.toUpperCase();
  const amount = cents / 100;
  const formatted = amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (upper === 'WOLD') return `${formatted} WOLD`;
  if (upper === 'USDT' || upper === 'USD') return `${formatted} USDT`;
  if (upper === 'CNY') return `¥${formatted}`;
  return `${formatted} ${upper}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function syncStatusLabel(status: string): string {
  const map: Record<string, string> = {
    running: '同步中',
    completed: '已完成',
    failed: '失败',
  };
  return map[status] ?? status;
}
