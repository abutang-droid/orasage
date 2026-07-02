'use client';

import type { ZiweiChart } from '@/lib/ziwei/types';
import { startAppCheckout, redirectAfterCheckout } from '@/lib/shop-checkout';
import { useT } from '@/lib/i18n';
import { useState } from 'react';

interface CrystalShopCardProps {
  reason: string;
  crystalSku: string;
}

export default function CrystalShopCard({ reason, crystalSku }: CrystalShopCardProps) {
  const t = useT();
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    try {
      const result = await startAppCheckout({
        sku: crystalSku,
        recommendationContext: reason,
        successUrl: typeof window !== 'undefined' ? `${window.location.origin}/chart?paid=1` : undefined,
      });
      redirectAfterCheckout(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 12,
      padding: '14px 16px',
      borderRadius: 'var(--r-md)',
      background: 'var(--bg-card)',
      border: '1px solid var(--orasage-gold-border, var(--gold-border))',
    }}>
      <span style={{ flex: 1, fontSize: 13, color: 'var(--tx-2)', lineHeight: 1.55 }}>
        {reason}
      </span>
      <button
        type="button"
        disabled={loading}
        onClick={() => void handleBuy()}
        style={{
          padding: '8px 16px',
          borderRadius: 'var(--r-md)',
          border: 'none',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? t('checkout.loading') : t('crystal.shop.buy')}
      </button>
    </div>
  );
}
