'use client';

import { useMemo, useState } from 'react';
import { Button } from '@orasage/ui/button';
import { TEMPLE_DONATION, templeDonationMeritRange, templeDonationQuantity } from '@/lib/merit';
import { useDonationCopy } from '@/lib/i18n/ui-strings';
import { buildLoginUrlFromWindow } from '@/lib/login-url';
import {
  startAppCheckout,
  redirectAfterCheckout,
  isCheckoutAuthRequiredError,
} from '@/lib/shop-checkout';
import './temple.css';

const PRESET_CENTS = [1, 10, 50, 100] as const;

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(cents < 100 ? 2 : 0)}`;
}

type TempleDonationProps = {
  deityName?: string;
};

export function TempleDonation({ deityName }: TempleDonationProps) {
  const copy = useDonationCopy();
  const [amountCents, setAmountCents] = useState<number>(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  const meritRange = useMemo(() => templeDonationMeritRange(amountCents), [amountCents]);
  const loginHref = buildLoginUrlFromWindow();

  async function handleDonate() {
    setLoading(true);
    setError(null);
    setNeedsLogin(false);
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
      if (isCheckoutAuthRequiredError(err)) {
        // Show a tappable login CTA (old UI was plain "请先登录" text) and jump immediately.
        setNeedsLogin(true);
        window.location.assign(buildLoginUrlFromWindow());
        return;
      }
      setError(err instanceof Error ? err.message : copy.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="temple-donation">
      <div className="temple-donation-label">{copy.label}</div>
      <p className="temple-donation-note">{copy.explanation}</p>
      <p className="temple-donation-formula">
        {copy.estimatedMerit}{' '}
        <span className="temple-donation-merit">
          {meritRange.min}–{meritRange.max}
        </span>
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
        {copy.customAmount} {formatUsd(amountCents)}
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

      <Button
        type="button"
        className="temple-donation-submit w-full"
        onClick={() => void handleDonate()}
        disabled={loading}
      >
        {loading ? copy.submitLoading : copy.submit(formatUsd(amountCents))}
      </Button>

      {needsLogin || error ? (
        <p className="temple-donation-error" role="alert">
          {needsLogin || /登录|login|sign in/i.test(error ?? '') ? (
            <>
              <span>{copy.loginRequired}</span>{' '}
              <a href={loginHref} className="temple-donation-login-link">
                {copy.loginCta}
              </a>
            </>
          ) : (
            error
          )}
        </p>
      ) : null}
    </div>
  );
}
