import type { ShopCurrency } from '../../../shared/shop-locale/index';
import {
  currencyForLocale,
  detectShopLocale,
  formatDualShopPrice,
  formatShopPrice,
  formatUsdtPrice,
  formatWoldPrice,
  resolvePriceCents,
  resolveUsdtCents,
  resolveWoldCents,
  woldPerUsdt,
} from '../../../shared/shop-locale/index';

export type { ShopCurrency };

export {
  currencyForLocale,
  detectShopLocale,
  formatDualShopPrice,
  formatShopPrice,
  formatUsdtPrice,
  formatWoldPrice,
  resolvePriceCents,
  resolveUsdtCents,
  resolveWoldCents,
  woldPerUsdt,
};

/** @deprecated use formatShopPrice / formatDualShopPrice */
export function formatProductPrice(cents: number, currency: ShopCurrency): string {
  if (currency === 'usd') return formatDualShopPrice(cents);
  return formatShopPrice(cents, currency);
}

export function toStripeAmount(
  pricing: { priceCents: number; priceCentsUsd?: number | null },
  currency: ShopCurrency,
): { currency: ShopCurrency; unit_amount: number } {
  const unit_amount = resolvePriceCents(pricing, currency);
  return { currency, unit_amount };
}
