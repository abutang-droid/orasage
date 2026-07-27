import type { PayCurrency, ShopCurrency } from '../../../shared/shop-locale/index';
import {
  currencyForLocale,
  detectShopLocale,
  formatDualShopPrice,
  formatPayPrice,
  formatShopPrice,
  formatUsdtPrice,
  formatWoldPrice,
  isPayCurrency,
  normalizePayCurrency,
  resolvePayAmountCents,
  resolvePriceCents,
  resolveUsdtCents,
  resolveWoldCents,
  setRuntimeWoldPerUsdt,
  usdtCentsToLegacyCnyCents,
  woldPerUsdt,
} from '../../../shared/shop-locale/index';

export type { PayCurrency, ShopCurrency };

export {
  currencyForLocale,
  detectShopLocale,
  formatDualShopPrice,
  formatPayPrice,
  formatShopPrice,
  formatUsdtPrice,
  formatWoldPrice,
  isPayCurrency,
  normalizePayCurrency,
  resolvePayAmountCents,
  resolvePriceCents,
  resolveUsdtCents,
  resolveWoldCents,
  setRuntimeWoldPerUsdt,
  usdtCentsToLegacyCnyCents,
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
