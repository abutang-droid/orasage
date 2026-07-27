const APP_LABELS: Record<string, string> = {
  main: '门户',
  shop: '商城',
  admin: '后台',
  bazi: '八字',
  ziwei: '紫微',
  tarot: '塔罗',
  cms: 'CMS',
  auth: '认证',
  unknown: '未知',
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
};

export function appLabel(app: string): string {
  return APP_LABELS[app] ?? app;
}

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function formatRevenue(cents: number): string {
  return `${(cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
}

export function formatDayLabel(day: string): string {
  const d = new Date(day);
  if (Number.isNaN(d.getTime())) return day;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
