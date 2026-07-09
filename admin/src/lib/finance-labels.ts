export function formatMoney(cents: number, currency = 'cny'): string {
  const upper = currency.toUpperCase();
  const amount = cents / 100;
  if (upper === 'CNY' || upper === 'CNY'.toLowerCase()) {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${upper} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
