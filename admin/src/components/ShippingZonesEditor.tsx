'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminShippingZone } from '@/lib/api';
import { saveShippingZonesAction } from '@/app/actions';

const LOCALES = [
  { code: 'zh-CN', label: '简体' },
  { code: 'en', label: 'English' },
] as const;

type ZoneDraft = Omit<AdminShippingZone, 'id'> & { id?: number };

function emptyZone(sortOrder: number): ZoneDraft {
  return {
    code: '',
    labelI18n: { 'zh-CN': '', en: '' },
    countryCodes: [],
    flatRateCents: 0,
    perRecipient: true,
    weightFreeGrams: null,
    weightBlockGrams: null,
    weightBlockCents: null,
    sortOrder,
    isDefault: false,
    active: true,
  };
}

function toDraft(z: AdminShippingZone): ZoneDraft {
  return {
    id: z.id,
    code: z.code,
    labelI18n: { ...z.labelI18n },
    countryCodes: [...z.countryCodes],
    flatRateCents: z.flatRateCents,
    perRecipient: z.perRecipient,
    weightFreeGrams: z.weightFreeGrams ?? null,
    weightBlockGrams: z.weightBlockGrams ?? null,
    weightBlockCents: z.weightBlockCents ?? null,
    sortOrder: z.sortOrder,
    isDefault: z.isDefault,
    active: z.active,
  };
}

export function ShippingZonesEditor({ zones }: { zones: AdminShippingZone[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<ZoneDraft[]>(
    zones.length > 0 ? zones.map(toDraft) : [emptyZone(0), emptyZone(1)],
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const update = (index: number, patch: Partial<ZoneDraft>) => {
    setDrafts((prev) => prev.map((z, i) => (i === index ? { ...z, ...patch } : z)));
    setSaved(false);
  };

  const onSave = async () => {
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const payload = drafts.map((z, i) => ({
        code: z.code.trim(),
        labelI18n: z.labelI18n,
        countryCodes: z.countryCodes,
        flatRateCents: z.flatRateCents,
        perRecipient: z.perRecipient,
        weightFreeGrams: z.weightFreeGrams,
        weightBlockGrams: z.weightBlockGrams,
        weightBlockCents: z.weightBlockCents,
        sortOrder: z.sortOrder ?? i,
        isDefault: z.isDefault,
        active: z.active,
      }));
      if (payload.some((z) => !z.code)) {
        throw new Error('每个区域需填写编码');
      }
      await saveShippingZonesAction(payload);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="shipping-zones-editor">
      {drafts.map((zone, index) => (
        <fieldset key={zone.id ?? `new-${index}`} className="panel shipping-zone-card">
          <legend>区域 {index + 1}</legend>
          <div className="form-grid">
            <label>
              编码
              <input
                value={zone.code}
                onChange={(e) => update(index, { code: e.target.value })}
                placeholder="domestic"
                required
              />
            </label>
            {LOCALES.map((loc) => (
              <label key={loc.code}>
                名称 · {loc.label}
                <input
                  value={zone.labelI18n[loc.code] ?? ''}
                  onChange={(e) =>
                    update(index, {
                      labelI18n: { ...zone.labelI18n, [loc.code]: e.target.value },
                    })
                  }
                />
              </label>
            ))}
            <label className="full-width">
              国家代码（逗号分隔，留空表示非默认兜底区）
              <input
                value={zone.countryCodes.join(',')}
                onChange={(e) =>
                  update(index, {
                    countryCodes: e.target.value
                      .split(',')
                      .map((c) => c.trim().toUpperCase())
                      .filter(Boolean),
                  })
                }
                placeholder="CN,HK,MO,TW"
              />
            </label>
            <label>
              基础运费（USDT）
              <input
                type="number"
                step="0.01"
                min="0"
                value={(zone.flatRateCents / 100).toFixed(2)}
                onChange={(e) =>
                  update(index, { flatRateCents: Math.round(Number(e.target.value) * 100) })
                }
              />
            </label>
            <label>
              排序
              <input
                type="number"
                value={zone.sortOrder}
                onChange={(e) => update(index, { sortOrder: Number(e.target.value) })}
              />
            </label>
            <label>
              免重（克）
              <input
                type="number"
                min="0"
                value={zone.weightFreeGrams ?? ''}
                onChange={(e) =>
                  update(index, {
                    weightFreeGrams: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="500"
              />
            </label>
            <label>
              续重块（克）
              <input
                type="number"
                min="1"
                value={zone.weightBlockGrams ?? ''}
                onChange={(e) =>
                  update(index, {
                    weightBlockGrams: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="500"
              />
            </label>
            <label>
              续重费（USDT/块）
              <input
                type="number"
                step="0.01"
                min="0"
                value={zone.weightBlockCents != null ? (zone.weightBlockCents / 100).toFixed(2) : ''}
                onChange={(e) =>
                  update(index, {
                    weightBlockCents: e.target.value
                      ? Math.round(Number(e.target.value) * 100)
                      : null,
                  })
                }
                placeholder="5.00"
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={zone.perRecipient}
                onChange={(e) => update(index, { perRecipient: e.target.checked })}
              />
              按收件人数计费
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={zone.isDefault}
                onChange={(e) => update(index, { isDefault: e.target.checked })}
              />
              默认兜底区域
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={zone.active}
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
              删除此区域
            </button>
          ) : null}
        </fieldset>
      ))}

      <div className="product-list-toolbar">
        <button
          type="button"
          className="btn-secondary btn-secondary--sm"
          onClick={() => setDrafts((prev) => [...prev, emptyZone(prev.length)])}
        >
          添加区域
        </button>
        <button type="button" className="btn-primary" disabled={pending} onClick={() => void onSave()}>
          {pending ? '保存中…' : '保存全部模板'}
        </button>
      </div>

      {saved ? <p className="muted panel-notice">已保存。</p> : null}
      {error ? <p className="panel-notice panel-notice--error">{error}</p> : null}
    </div>
  );
}
