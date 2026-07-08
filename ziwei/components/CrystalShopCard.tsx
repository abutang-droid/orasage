'use client';

import type { ZiweiChart } from '@/lib/ziwei/types';
import { startAppCheckout, redirectAfterCheckout } from '@/lib/shop-checkout';
import { useT } from '@/lib/i18n';
import { useState } from 'react';
import { Button } from '@orasage/ui/button';
import { Card } from '@orasage/ui/card';

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
    <Card
      className="flex flex-wrap items-center gap-3 rounded-[var(--r-md)] border-[var(--orasage-gold-border,var(--gold-border))] p-4 shadow-none"
      style={{ background: 'var(--bg-card)' }}
    >
      <span className="flex-1 text-[13px] leading-relaxed" style={{ color: 'var(--tx-2)' }}>
        {reason}
      </span>
      <Button
        type="button"
        disabled={loading}
        loading={loading}
        onClick={() => void handleBuy()}
        className="ziwei-calc-submit shrink-0 px-4 py-2 text-[13px]"
      >
        {t('crystal.shop.buy')}
      </Button>
    </Card>
  );
}
