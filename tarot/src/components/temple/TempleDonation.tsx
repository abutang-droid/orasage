'use client';

import { useMemo, useState } from 'react';
import { TEMPLE_DONATION, templeDonationMeritRange, templeDonationQuantity } from '@/lib/merit';
import { startAppCheckout, redirectAfterCheckout } from '@/lib/shop-checkout';
import './temple.css';

const PRESET_CENTS = [1, 10, 50, 100] as const;

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(cents < 100 ? 2 : 0)}`;
}

type TempleDonationProps = {
  deityName?: string;
};

export function TempleDonation({ deityName }: TempleDonationProps) {
  const [amountCents, setAmountCents] = useState<number>(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meritRange = useMemo(() => templeDonationMeritRange(amountCents), [amountCents]);

  async function handleDonate() {
    setLoading(true);
    setError(null);
    try {
      const returnUrl = `${window.location.origin}/temple?donated=1`;
      const result = await startAppCheckout({
        sku: TEMPLE_DONATION.sku,
        quantity: templeDonationQuantity(amountCents),
        recommendationContext: deityName ? `祈福乐捐：${deityName}` : '祈福乐捐',
        successUrl: returnUrl,
        cancelUrl: returnUrl,
      });
      redirectAfterCheckout(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '乐捐失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="temple-donation">
      <div className="temple-donation-label">── 自愿乐捐 ──</div>
      <p className="temple-donation-note">{TEMPLE_DONATION.explanationZh}</p>
      <p className="temple-donation-formula">
        预计功德 <span className="temple-donation-merit">{meritRange.min}–{meritRange.max}</span>
      </p>

      <div className="temple-donation-presets">
        {PRESET_CENTS.map((cents) => (
          <button
            key={cents}
            type="button"
            className={`temple-donation-preset${amountCents === cents ? ' is-active' : ''}`}
            onClick={() => setAmountCents(cents)}
            disabled={loading}
          >
            {formatUsd(cents)}
          </button>
        ))}
      </div>

      <label className="temple-donation-slider-label">
        自定义金额 {formatUsd(amountCents)}
        <input
          type="range"
          className="temple-donation-slider"
          min={TEMPLE_DONATION.minCentsUsd}
          max={TEMPLE_DONATION.maxCentsUsd}
          step={1}
          value={amountCents}
          onChange={(e) => setAmountCents(Number(e.target.value))}
          disabled={loading}
        />
      </label>

      <button
        type="button"
        className="btn-primary temple-donation-submit"
        onClick={() => void handleDonate()}
        disabled={loading}
      >
        {loading ? '跳转支付…' : `乐捐 ${formatUsd(amountCents)}`}
      </button>

      {error && <p className="temple-donation-error">{error}</p>}
    </div>
  );
}
