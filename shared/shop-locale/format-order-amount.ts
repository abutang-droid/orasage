import { formatUsdtPrice, formatWoldPrice, normalizePayCurrency } from './index';

/** 订单/后台金额展示：USDT / WOLD；遗留 CNY 仍显示 ¥ */
export function formatOrderAmountDisplay(amountCents: number, currency?: string | null): string {
  const pay = normalizePayCurrency(currency);
  if (pay === 'WOLD') return formatWoldPrice(amountCents);
  if (pay === 'USDT') return formatUsdtPrice(amountCents);
  const cur = (currency ?? 'USDT').toUpperCase();
  if (cur === 'CNY') return `¥${(amountCents / 100).toFixed(2)}`;
  if (cur === 'USD') return formatUsdtPrice(amountCents);
  return `${(amountCents / 100).toFixed(2)} ${cur}`;
}
