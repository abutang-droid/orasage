'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminCoupon } from '@/lib/api';
import { saveCouponsAction } from '@/app/actions';

type CouponDraft = Omit<AdminCoupon, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>;

function emptyCoupon(): CouponDraft {
  return {
    code: '',
    labelI18n: { 'zh-CN': '', en: '' },
    discountType: 'percent',
    discountValue: 10,
    minOrderCents: 0,
    maxUses: null,
    startsAt: null,
    endsAt: null,
    active: true,
  };
}

function toDraft(c: AdminCoupon): CouponDraft {
  return {
    code: c.code,
    labelI18n: { ...c.labelI18n },
    discountType: c.discountType,
    discountValue: c.discountValue,
    minOrderCents: c.minOrderCents,
    maxUses: c.maxUses,
    startsAt: c.startsAt,
    endsAt: c.endsAt,
    active: c.active,
  };
}

function toIsoInput(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 16);
}

export function CouponsEditor({ coupons }: { coupons: AdminCoupon[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<CouponDraft[]>(
    coupons.length > 0 ? coupons.map(toDraft) : [emptyCoupon()],
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const update = (index: number, patch: Partial<CouponDraft>) => {
    setDrafts((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
    setSaved(false);
  };

  const onSave = async () => {
    setPending(true);
    setError(null);
    try {
      const payload = drafts.map((c) => ({
        ...c,
        code: c.code.trim().toUpperCase(),
        startsAt: c.startsAt ? new Date(c.startsAt).toISOString() : null,
        endsAt: c.endsAt ? new Date(c.endsAt).toISOString() : null,
      }));
      if (payload.some((c) => !c.code)) throw new Error('请填写优惠码');
      await saveCouponsAction(payload);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="coupons-editor">
      {drafts.map((coupon, index) => (
        <fieldset key={`${coupon.code}-${index}`} className="panel shipping-zone-card">
          <legend>优惠码 {index + 1}</legend>
          <div className="form-grid">
            <label>
              代码
              <input
                value={coupon.code}
                onChange={(e) => update(index, { code: e.target.value.toUpperCase() })}
                placeholder="SPRING10"
              />
            </label>
            <label>
              名称（简体）
              <input
                value={coupon.labelI18n['zh-CN'] ?? ''}
                onChange={(e) =>
                  update(index, { labelI18n: { ...coupon.labelI18n, 'zh-CN': e.target.value } })
                }
              />
            </label>
            <label>
              类型
              <select
                value={coupon.discountType}
                onChange={(e) =>
                  update(index, { discountType: e.target.value as 'percent' | 'fixed_cents' })
                }
              >
                <option value="percent">百分比折扣</option>
                <option value="fixed_cents">固定减免（分）</option>
              </select>
            </label>
            <label>
              折扣值
              <input
                type="number"
                min="0"
                value={coupon.discountValue}
                onChange={(e) => update(index, { discountValue: Number(e.target.value) })}
              />
            </label>
            <label>
              最低订单（USDT）
              <input
                type="number"
                step="0.01"
                min="0"
                value={(coupon.minOrderCents / 100).toFixed(2)}
                onChange={(e) =>
                  update(index, { minOrderCents: Math.round(Number(e.target.value) * 100) })
                }
              />
            </label>
            <label>
              最大使用次数
              <input
                type="number"
                min="1"
                value={coupon.maxUses ?? ''}
                onChange={(e) =>
                  update(index, { maxUses: e.target.value ? Number(e.target.value) : null })
                }
                placeholder="不限"
              />
            </label>
            <label>
              开始时间
              <input
                type="datetime-local"
                value={toIsoInput(coupon.startsAt ?? undefined)}
                onChange={(e) =>
                  update(index, { startsAt: e.target.value ? new Date(e.target.value).toISOString() : null })
                }
              />
            </label>
            <label>
              结束时间
              <input
                type="datetime-local"
                value={toIsoInput(coupon.endsAt ?? undefined)}
                onChange={(e) =>
                  update(index, { endsAt: e.target.value ? new Date(e.target.value).toISOString() : null })
                }
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={coupon.active}
                onChange={(e) => update(index, { active: e.target.checked })}
              />
              启用
            </label>
          </div>
          {drafts.length > 1 ? (
            <button
              type="button"
              className="btn-secondary btn-secondary--sm"
              onClick={() => setDrafts((prev) => prev.filter((_, i) => i !== index))}
            >
              删除
            </button>
          ) : null}
        </fieldset>
      ))}

      <div className="product-list-toolbar">
        <button
          type="button"
          className="btn-secondary btn-secondary--sm"
          onClick={() => setDrafts((prev) => [...prev, emptyCoupon()])}
        >
          添加优惠码
        </button>
        <button type="button" className="btn-primary" disabled={pending} onClick={() => void onSave()}>
          {pending ? '保存中…' : '保存全部'}
        </button>
      </div>

      {saved ? <p className="muted panel-notice">已保存。</p> : null}
      {error ? <p className="panel-notice panel-notice--error">{error}</p> : null}
    </div>
  );
}
