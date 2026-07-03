'use client';

import { useShopCurrency } from '@/components/CurrencyProvider';
import type { ShopCurrency } from '@/lib/currency';

export function CurrencyToggle() {
  const { currency, setCurrency } = useShopCurrency();

  return (
    <div className="flex items-center gap-1 rounded-full border border-sage-border bg-sage-card p-1 text-xs">
      {(['cny', 'usd'] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setCurrency(code)}
          className={`rounded-full px-3 py-1.5 font-medium transition ${
            currency === code
              ? 'bg-sage-gold/15 text-sage-gold'
              : 'text-sage-muted active:text-sage-primary'
          }`}
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
