'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ShopCurrency } from '@/lib/currency';
import { detectCurrency, isShopCurrency } from '@/lib/currency';

const STORAGE_KEY = 'orasage_shop_currency';

type CurrencyContextValue = {
  currency: ShopCurrency;
  setCurrency: (currency: ShopCurrency) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<ShopCurrency>('cny');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('currency');
    if (fromQuery && isShopCurrency(fromQuery)) {
      setCurrencyState(fromQuery);
      sessionStorage.setItem(STORAGE_KEY, fromQuery);
      return;
    }
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && isShopCurrency(stored)) {
      setCurrencyState(stored);
      return;
    }
    setCurrencyState(detectCurrency(navigator.language));
  }, []);

  const setCurrency = useCallback((next: ShopCurrency) => {
    setCurrencyState(next);
    sessionStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo(() => ({ currency, setCurrency }), [currency, setCurrency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useShopCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useShopCurrency must be used within CurrencyProvider');
  return ctx;
}
