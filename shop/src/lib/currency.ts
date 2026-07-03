export type ShopCurrency = 'cny' | 'usd';

const CNY_TO_USD_RATE = Number(process.env.CNY_TO_USD_RATE ?? '7.2');

export function isShopCurrency(value: string): value is ShopCurrency {
  return value === 'cny' || value === 'usd';
}

export function detectCurrency(acceptLanguage?: string | null): ShopCurrency {
  if (!acceptLanguage) return 'cny';
  const lang = acceptLanguage.toLowerCase();
  if (lang.startsWith('en') || lang.startsWith('pt') || lang.includes('us')) return 'usd';
  return 'cny';
}

/** Stripe charge amount in the requested currency's smallest unit */
export function toStripeAmount(cnyCents: number, currency: ShopCurrency): { currency: ShopCurrency; unit_amount: number } {
  if (currency === 'cny') {
    return { currency: 'cny', unit_amount: cnyCents };
  }
  const usdCents = Math.max(50, Math.round((cnyCents / 100 / CNY_TO_USD_RATE) * 100));
  return { currency: 'usd', unit_amount: usdCents };
}

export function formatProductPrice(cnyCents: number, currency: ShopCurrency): string {
  if (currency === 'cny') return `¥${(cnyCents / 100).toFixed(2)}`;
  return `$${(cnyCents / 100 / CNY_TO_USD_RATE).toFixed(2)}`;
}
