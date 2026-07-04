import type { ShopCurrency } from '../../../shared/shop-locale/index';
import {
  currencyForLocale,
  detectShopLocale,
  formatShopPrice,
  resolvePriceCents,
} from '../../../shared/shop-locale/index';

export type { ShopCurrency };

export {
  currencyForLocale,
  detectShopLocale,
  formatShopPrice,
  resolvePriceCents,
};

/** @deprecated use formatShopPrice */
export function formatProductPrice(cents: number, currency: ShopCurrency): string {
  return formatShopPrice(cents, currency);
}

export function toStripeAmount(
  pricing: { priceCents: number; priceCentsUsd?: number | null },
  currency: ShopCurrency,
): { currency: ShopCurrency; unit_amount: number } {
  const unit_amount = resolvePriceCents(pricing, currency);
  return { currency, unit_amount };
}
