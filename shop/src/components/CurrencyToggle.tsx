'use client';

import { useShopCurrency } from '@/components/CurrencyProvider';
import type { ShopCurrency } from '@/lib/currency';

export function CurrencyToggle() {
  const { currency, setCurrency } = useShopCurrency();

  return (
    <div className="shop-currency-toggle" role="group" aria-label="货币选择">
      {(['cny', 'usd'] as const).map((code) => (
        <button
          key={code}
          type="button"
          data-active={currency === code}
          onClick={() => setCurrency(code)}
          className="shop-currency-btn"
        >
          {code === 'cny' ? '¥ CNY' : '$ USD'}
        </button>
      ))}
    </div>
  );
}

export function useCurrencyCode(): ShopCurrency {
  return useShopCurrency().currency;
}
