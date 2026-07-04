'use client';

import { useState } from 'react';
import type { ShippingPayload, ShippingRecipient } from '../../../shared/shop-fulfillment/index';

type Props = {
  orderNo: string;
  productTitle: string;
  couple?: boolean;
  requireWrist?: boolean;
  onSaved: () => void;
};

function emptyRecipient(): ShippingRecipient {
  return { name: '', phone: '', address: '', wristCm: '' };
}

export function ShippingForm({ orderNo, productTitle, couple = false, requireWrist = false, onSaved }: Props) {
  const [recipients, setRecipients] = useState<ShippingRecipient[]>(
    couple ? [emptyRecipient(), emptyRecipient()] : [emptyRecipient()],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRecipient(index: number, field: keyof ShippingRecipient, value: string) {
    setRecipients((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
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
        body: JSON.stringify(payload),
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
      <p className="shop-shipping-note">7-14 个工作日发货</p>

      {recipients.map((recipient, index) => (
        <fieldset key={index} className="shop-shipping-fieldset">
          {couple ? (
            <legend className="shop-shipping-legend">{index === 0 ? '第一位' : '第二位'}</legend>
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
            省 / 市 / 区 / 详细地址
            <textarea
              className="shop-shipping-textarea"
              rows={3}
              value={recipient.address}
              onChange={(e) => updateRecipient(index, 'address', e.target.value)}
              autoComplete="street-address"
              required
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

      {error ? <p className="shop-shipping-error">{error}</p> : null}

      <button type="submit" className="shop-btn-primary shop-shipping-submit" disabled={loading}>
        {loading ? '保存中…' : '确认收货信息'}
      </button>
    </form>
  );
}
