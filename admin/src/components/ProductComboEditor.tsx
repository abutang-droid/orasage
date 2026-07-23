'use client';

import { useMemo, useState } from 'react';
import type { AdminProduct } from '@/lib/api';

export type ComboItemDraft = {
  componentSku: string;
  quantity: number;
  role: 'fixed' | 'element_crystal';
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
    role: item.role === 'element_crystal' ? 'element_crystal' : 'fixed',
  }));

  const [items, setItems] = useState<ComboItemDraft[]>(
    initialItems.length > 0 ? initialItems : [{ componentSku: '', quantity: 1, role: 'fixed' }],
  );
  const [useComponentSum, setUseComponentSum] = useState(product?.comboUseComponentSum ?? true);

  const componentOptions = useMemo(
    () => catalog.filter((p) => p.active && p.kind !== 'combo' && p.kind !== 'diy' && p.sku !== product?.sku),
    [catalog, product?.sku],
  );

  const crystalOptions = useMemo(
    () => componentOptions.filter((p) => p.category === 'crystal' || p.sku.startsWith('crystal-')),
    [componentOptions],
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

  const hasElementCrystal = items.some((item) => item.role === 'element_crystal' && item.componentSku);

  const updateItem = (index: number, patch: Partial<ComboItemDraft>) => {
    setItems((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { componentSku: '', quantity: 1, role: 'fixed' }]);
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
        选择数字商品、实体商品等作为子项。水晶可选「五行推荐变量」：定价用组合价/参考价，实际发货按八字五行从计费槽
        <code> recommend.element.* </code>
        解析，不是固定搭配某一款水晶。
      </p>

      <div className="product-combo-rows">
        {items.map((item, index) => {
          const options = item.role === 'element_crystal' ? crystalOptions : componentOptions;
          return (
            <div key={index} className="product-combo-row">
              <label>
                子项角色
                <select
                  value={item.role}
                  onChange={(e) => {
                    const role = e.target.value === 'element_crystal' ? 'element_crystal' : 'fixed';
                    updateItem(index, {
                      role,
                      componentSku: role === 'element_crystal' && !item.componentSku.startsWith('crystal-')
                        ? ''
                        : item.componentSku,
                    });
                  }}
                >
                  <option value="fixed">固定商品</option>
                  <option value="element_crystal">五行推荐水晶（变量）</option>
                </select>
              </label>
              <label>
                {item.role === 'element_crystal' ? '参考/回退 SKU' : '子商品'}
                <select
                  value={item.componentSku}
                  onChange={(e) => updateItem(index, { componentSku: e.target.value })}
                >
                  <option value="">选择 SKU…</option>
                  {options.map((p) => (
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
          );
        })}
      </div>

      <button type="button" className="btn-secondary" onClick={addItem}>
        + 添加子商品
      </button>

      <div className="product-combo-summary">
        <p>
          子商品合计{hasElementCrystal ? '（含变量水晶参考价）' : ''}：
          <strong>¥{formatYuan(componentSumCents)}</strong>
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
          使用子商品价合计（不勾选则使用上方填写的组合优惠价）
        </label>
        {!useComponentSum && product ? (
          <p className="muted">
            当前组合优惠价：¥{formatYuan(product.priceCents)}
            {product.priceCentsUsd ? ` / $${formatYuan(product.priceCentsUsd)}` : ''}
            {hasElementCrystal ? ' · 顾客按此价支付，水晶 SKU 随五行变化' : ''}
          </p>
        ) : null}
        {hasElementCrystal ? (
          <p className="muted">
            变量水晶：结账时按测算结果写入订单履约信息；缺省回退到上方所选参考 SKU。
          </p>
        ) : null}
        <p className={requiresShipping ? 'product-combo-ship-yes' : 'muted'}>
          发货要求：{requiresShipping ? '需要收货地址（含实体子商品）' : '无需发货'}
        </p>
      </div>
    </div>
  );
}
