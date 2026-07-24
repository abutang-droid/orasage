'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatDualShopPrice, formatShopPrice } from '@/lib/currency';

export type CouponState = {
  couponCode: string | null;
  subtotalCents: number;
  amountCents: number;
  savingsCents: number;
};

type Props = {
  orderNo: string;
  currency: string;
  initial: CouponState;
  onUpdated: (next: CouponState) => void;
  /** 命理 App 等订单不支持优惠码 */
  disabled?: boolean;
};

function formatMoney(cents: number, currency: string) {
  const upper = currency?.toUpperCase() ?? 'USD';
  if (upper === 'CNY') return formatShopPrice(cents, 'cny');
  return formatDualShopPrice(cents);
}

export function CheckoutCouponForm({ orderNo, currency, initial, onUpdated, disabled }: Props) {
  const t = useTranslations('checkout');
  const [code, setCode] = useState(initial.couponCode ?? '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<CouponState>(initial);

  const onApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    const trimmed = code.trim();
    if (!trimmed) {
      setError(t('couponRequired'));
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderNo)}/coupon`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t('couponApplyFailed'));
      const next: CouponState = {
        couponCode: data.couponCode ?? trimmed.toUpperCase(),
        subtotalCents: data.subtotalCents,
        amountCents: data.amountCents,
        savingsCents: data.savingsCents ?? 0,
      };
      setApplied(next);
      setCode(next.couponCode ?? trimmed);
      onUpdated(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('couponApplyFailed'));
    } finally {
      setPending(false);
    }
  };

  const onRemove = async () => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderNo)}/coupon`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t('couponRemoveFailed'));
      const next: CouponState = {
        couponCode: null,
        subtotalCents: data.subtotalCents,
        amountCents: data.amountCents,
        savingsCents: 0,
      };
      setApplied(next);
      setCode('');
      onUpdated(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('couponRemoveFailed'));
    } finally {
      setPending(false);
    }
  };

  if (disabled) return null;

  const hasCoupon = Boolean(applied.couponCode && applied.savingsCents > 0);

  return (
    <div className="shop-checkout-coupon">
      {hasCoupon ? (
        <div className="shop-checkout-coupon-applied">
          <p className="shop-checkout-coupon-line">
            <span>{t('couponApplied', { code: applied.couponCode ?? '' })}</span>
            <strong>{t('couponSaved', { amount: formatMoney(applied.savingsCents, currency) })}</strong>
          </p>
          {applied.subtotalCents > applied.amountCents ? (
            <p className="shop-checkout-coupon-subtotal muted">
              {t('couponSubtotal', { amount: formatMoney(applied.subtotalCents, currency) })}
            </p>
          ) : null}
          <button
            type="button"
            className="shop-checkout-coupon-remove"
            disabled={pending}
            onClick={() => void onRemove()}
          >
            {t('couponRemove')}
          </button>
        </div>
      ) : (
        <form className="shop-checkout-coupon-form" onSubmit={(e) => void onApply(e)}>
          <label className="shop-checkout-coupon-label">
            {t('couponLabel')}
            <div className="shop-checkout-coupon-row">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={t('couponPlaceholder')}
                autoComplete="off"
                spellCheck={false}
              />
              <button type="submit" disabled={pending}>
                {pending ? t('processing') : t('couponApply')}
              </button>
            </div>
          </label>
        </form>
      )}
      {error ? <p className="shop-checkout-coupon-error">{error}</p> : null}
    </div>
  );
}
