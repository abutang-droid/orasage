'use client';

import { useMemo, useState } from 'react';
import type { AdminProduct } from '@/lib/api';

export type ComboItemDraft = {
  componentSku: string;
  quantity: number;
};

type ProductComboEditorProps = {
  product?: AdminProduct | null;
  catalog: AdminProduct[];
};

function formatYuan(cents: number) {
  return (cents / 100).toFixed(2);
}

export function ProductComboEditor({ product, catalog }: ProductComboEditorProps) {
  const initialItems: ComboItemDraft[] = (product?.comboItems ?? []).map((item) => ({
    componentSku: item.componentSku,
    quantity: item.quantity,
  }));

  const [items, setItems] = useState<ComboItemDraft[]>(
    initialItems.length > 0 ? initialItems : [{ componentSku: '', quantity: 1 }],
  );
  const [useComponentSum, setUseComponentSum] = useState(product?.comboUseComponentSum ?? true);

  const componentOptions = useMemo(
    () => catalog.filter((p) => p.active && p.kind !== 'combo' && p.kind !== 'diy' && p.sku !== product?.sku),
    [catalog, product?.sku],
  );

  const componentSumCents = useMemo(() => {
    return items.reduce((sum, item) => {
      const found = componentOptions.find((p) => p.sku === item.componentSku);
      if (!found) return sum;
      return sum + found.priceCents * Math.max(1, item.quantity);
    }, 0);
  }, [items, componentOptions]);

  const componentSumUsdCents = useMemo(() => {
    let sum = 0;
    let complete = true;
    for (const item of items) {
      const found = componentOptions.find((p) => p.sku === item.componentSku);
      if (!found) continue;
      if (found.priceCentsUsd == null) {
        complete = false;
        break;
      }
      sum += found.priceCentsUsd * Math.max(1, item.quantity);
    }
    return complete ? sum : null;
  }, [items, componentOptions]);

  const requiresShipping = useMemo(() => {
    return items.some((item) => {
      const found = componentOptions.find((p) => p.sku === item.componentSku);
      return found?.requiresShipping;
    });
  }, [items, componentOptions]);

  const updateItem = (index: number, patch: Partial<ComboItemDraft>) => {
    setItems((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { componentSku: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const serializedItems = items.filter((item) => item.componentSku.trim());

  return (
    <div className="product-combo-editor">
      <input type="hidden" name="comboItemsJson" value={JSON.stringify(serializedItems)} />
      <input type="hidden" name="comboUseComponentSum" value={useComponentSum ? '1' : '0'} />

      <p className="muted">
        组合商品由数字商品与实体商品等组成。价格默认按子商品合计；可勾选下方选项后，在「基础信息」中设定组合优惠价。
      </p>

      <div className="product-combo-rows">
        {items.map((item, index) => (
          <div key={index} className="product-combo-row">
            <label>
              子商品
              <select
                value={item.componentSku}
                onChange={(e) => updateItem(index, { componentSku: e.target.value })}
              >
                <option value="">选择 SKU…</option>
                {componentOptions.map((p) => (
                  <option key={p.sku} value={p.sku}>
                    {p.sku} · {p.name}（{p.kind === 'standard' ? '实体' : p.kind === 'digital' ? '数字' : '服务'} · ¥{formatYuan(p.priceCents)}）
                  </option>
                ))}
              </select>
            </label>
            <label>
              数量
              <input
                type="number"
                min={1}
                max={99}
                value={item.quantity}
                onChange={(e) => updateItem(index, { quantity: Number(e.target.value) || 1 })}
              />
            </label>
            <button type="button" className="btn-ghost" onClick={() => removeItem(index)}>
              移除
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="btn-secondary" onClick={addItem}>
        + 添加子商品
      </button>

      <div className="product-combo-summary">
        <p>
          子商品合计：<strong>¥{formatYuan(componentSumCents)}</strong>
          {componentSumUsdCents != null ? (
            <span className="muted"> / ${formatYuan(componentSumUsdCents)}</span>
          ) : null}
        </p>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={useComponentSum}
            onChange={(e) => setUseComponentSum(e.target.checked)}
          />
          使用子商品价合计（不勾选则在基础信息中填写组合优惠价）
        </label>
        {!useComponentSum && product ? (
          <p className="muted">
            当前组合优惠价：¥{formatYuan(product.priceCents)}
            {product.priceCentsUsd ? ` / $${formatYuan(product.priceCentsUsd)}` : ''}
          </p>
        ) : null}
        <p className={requiresShipping ? 'product-combo-ship-yes' : 'muted'}>
          发货要求：{requiresShipping ? '需要收货地址（含实体子商品）' : '无需发货'}
        </p>
      </div>
    </div>
  );
}
