'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@orasage/ui/button';
import {
  SHIPPING_COUNTRIES,
  estimateShippingFeeCents,
  type ShippingPayload,
  type ShippingRecipient,
} from '../../../shared/shop-fulfillment/index';
import { addressToRecipient, type UserAddress } from '@/lib/addresses';

type Props = {
  orderNo: string;
  productTitle: string;
  coupleEligible?: boolean;
  couple?: boolean;
  onCoupleChange?: (couple: boolean) => void;
  requireWrist?: boolean;
  onSaved: () => void;
};

function emptyRecipient(): ShippingRecipient {
  return { name: '', phone: '', countryCode: 'CN', address: '', wristCm: '' };
}

export function ShippingForm({
  orderNo,
  productTitle,
  coupleEligible = false,
  couple = false,
  onCoupleChange,
  requireWrist = false,
  onSaved,
}: Props) {
  const [recipients, setRecipients] = useState<ShippingRecipient[]>(
    couple ? [emptyRecipient(), emptyRecipient()] : [emptyRecipient()],
  );
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [saveToAddressBook, setSaveToAddressBook] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRecipients(couple ? [emptyRecipient(), emptyRecipient()] : [emptyRecipient()]);
  }, [couple]);

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/addresses', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.addresses) return;
        setSavedAddresses(data.addresses);
        const defaults = data.addresses as UserAddress[];
        if (defaults.length > 0) {
          setRecipients((prev) => prev.map((_, i) => {
            const addr = defaults[i] ?? defaults[0];
            return addr ? addressToRecipient(addr) : emptyRecipient();
          }));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const shippingFeeCents = useMemo(() => {
    const primary = recipients[0]?.countryCode ?? 'CN';
    return estimateShippingFeeCents(primary, couple ? 2 : 1);
  }, [recipients, couple]);

  function updateRecipient(index: number, field: keyof ShippingRecipient, value: string) {
    setRecipients((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  function applySavedAddress(index: number, addressId: string) {
    const addr = savedAddresses.find((a) => String(a.id) === addressId);
    if (!addr) return;
    setRecipients((prev) => prev.map((r, i) => (i === index ? addressToRecipient(addr) : r)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload: ShippingPayload = { recipients };
    try {
      const qs = couple ? '?shipping=couple' : '';
      const res = await fetch(`/api/orders/${encodeURIComponent(orderNo)}/shipping${qs}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, saveToAddressBook }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || '保存失败');
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="shop-shipping-form" onSubmit={(e) => void handleSubmit(e)}>
      <h1 className="shop-shipping-title">填写收货信息</h1>
      <p className="shop-shipping-subtitle">{productTitle}</p>
      <p className="shop-shipping-note">全球配送 · 7-14 个工作日发货</p>

      {coupleEligible ? (
        <fieldset className="shop-shipping-couple-toggle">
          <legend className="shop-shipping-legend">配送人数</legend>
          <label className="shop-shipping-toggle-option">
            <input
              type="radio"
              name="coupleMode"
              checked={!couple}
              onChange={() => onCoupleChange?.(false)}
            />
            仅 1 人地址
          </label>
          <label className="shop-shipping-toggle-option">
            <input
              type="radio"
              name="coupleMode"
              checked={couple}
              onChange={() => onCoupleChange?.(true)}
            />
            2 人各一地址
          </label>
        </fieldset>
      ) : null}

      {shippingFeeCents > 0 ? (
        <p className="shop-shipping-fee">预估运费：¥{(shippingFeeCents / 100).toFixed(2)}</p>
      ) : (
        <p className="shop-shipping-fee shop-shipping-fee--free">运费：免邮</p>
      )}

      {recipients.map((recipient, index) => (
        <fieldset key={index} className="shop-shipping-fieldset">
          {couple ? (
            <legend className="shop-shipping-legend">{index === 0 ? '第一位' : '第二位'}</legend>
          ) : null}

          {savedAddresses.length > 0 ? (
            <label className="shop-shipping-label">
              从地址簿选择
              <select
                className="shop-shipping-input"
                defaultValue=""
                onChange={(e) => applySavedAddress(index, e.target.value)}
              >
                <option value="">手动填写</option>
                {savedAddresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {(addr.label ? `${addr.label} · ` : '') + addr.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="shop-shipping-label">
            收货人姓名
            <input
              type="text"
              className="shop-shipping-input"
              value={recipient.name}
              onChange={(e) => updateRecipient(index, 'name', e.target.value)}
              autoComplete="name"
              required
            />
          </label>

          <label className="shop-shipping-label">
            联系电话
            <input
              type="tel"
              className="shop-shipping-input"
              value={recipient.phone}
              onChange={(e) => updateRecipient(index, 'phone', e.target.value)}
              autoComplete="tel"
              required
            />
          </label>

          <label className="shop-shipping-label">
            国家/地区
            <select
              className="shop-shipping-input"
              value={recipient.countryCode ?? 'CN'}
              onChange={(e) => updateRecipient(index, 'countryCode', e.target.value)}
              required
            >
              {SHIPPING_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </label>

          <label className="shop-shipping-label">
            省 / 州
            <input
              type="text"
              className="shop-shipping-input"
              value={recipient.province ?? ''}
              onChange={(e) => updateRecipient(index, 'province', e.target.value)}
              autoComplete="address-level1"
            />
          </label>

          <label className="shop-shipping-label">
            城市
            <input
              type="text"
              className="shop-shipping-input"
              value={recipient.city ?? ''}
              onChange={(e) => updateRecipient(index, 'city', e.target.value)}
              autoComplete="address-level2"
            />
          </label>

          <label className="shop-shipping-label">
            详细地址
            <textarea
              className="shop-shipping-textarea"
              rows={3}
              value={recipient.address}
              onChange={(e) => updateRecipient(index, 'address', e.target.value)}
              autoComplete="street-address"
              required
            />
          </label>

          <label className="shop-shipping-label">
            邮编（选填）
            <input
              type="text"
              className="shop-shipping-input"
              value={recipient.postalCode ?? ''}
              onChange={(e) => updateRecipient(index, 'postalCode', e.target.value)}
              autoComplete="postal-code"
            />
          </label>

          {requireWrist ? (
            <label className="shop-shipping-label">
              手腕周长（cm）
              <input
                type="text"
                inputMode="decimal"
                className="shop-shipping-input"
                placeholder="例如 16"
                value={recipient.wristCm ?? ''}
                onChange={(e) => updateRecipient(index, 'wristCm', e.target.value)}
                required
              />
            </label>
          ) : null}
        </fieldset>
      ))}

      <label className="shop-shipping-save-book">
        <input
          type="checkbox"
          checked={saveToAddressBook}
          onChange={(e) => setSaveToAddressBook(e.target.checked)}
        />
        保存到地址簿
      </label>

      {error ? <p className="shop-shipping-error">{error}</p> : null}

      <Button type="submit" className="shop-shipping-submit w-full" disabled={loading} loading={loading}>
        {loading ? '保存中…' : '确认收货信息'}
      </Button>

      <p className="shop-shipping-manage">
        <a href="/account/addresses">管理地址簿</a>
      </p>
    </form>
  );
}
