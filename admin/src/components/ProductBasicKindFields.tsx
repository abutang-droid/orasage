'use client';

import { useState } from 'react';
import type { AdminProduct } from '@/lib/api';
import { ProductComboEditor } from './ProductComboEditor';

const KIND_OPTIONS = [
  { value: 'standard', label: '实体商品' },
  { value: 'digital', label: '数字商品（报告等）' },
  { value: 'service', label: '服务' },
  { value: 'diy', label: 'DIY 定制' },
  { value: 'combo', label: '组合商品（数字+实体等）' },
] as const;

const VISIBILITY_OPTIONS = [
  { value: 'public', label: '公开（商城目录可见）' },
  { value: 'unlisted', label: '仅直链（目录隐藏）' },
  { value: 'app_only', label: '仅计费（App 调用，前台不展示）' },
] as const;

type ProductBasicKindFieldsProps = {
  product?: AdminProduct | null;
  catalog: AdminProduct[];
};

export function ProductBasicKindFields({ product, catalog }: ProductBasicKindFieldsProps) {
  const [kind, setKind] = useState<string>(product?.kind ?? 'standard');

  return (
    <>
      {/* 哨兵字段：确保 PATCH 能区分「未提交」与「显式取消勾选」 */}
      <input type="hidden" name="active_present" value="1" />
      <input type="hidden" name="requiresShipping_present" value="1" />
      <input type="hidden" name="tagIds_present" value="1" />
      <label>
        形态
        <select name="kind" value={kind} onChange={(e) => setKind(e.target.value)}>
          {KIND_OPTIONS.map((k) => (
            <option key={k.value} value={k.value}>{k.label}</option>
          ))}
        </select>
      </label>
      <label>
        可见性
        <select name="visibility" defaultValue={product?.visibility ?? 'public'}>
          {VISIBILITY_OPTIONS.map((v) => (
            <option key={v.value} value={v.value}>{v.label}</option>
          ))}
        </select>
      </label>
      <label>
        价格 USDT{kind === 'combo' ? '（组合优惠价）' : ''}
        <input
          name="priceUsdt"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={
            product?.priceCentsUsd != null
              ? (product.priceCentsUsd / 100).toFixed(2)
              : product
                ? (product.priceCents / 100).toFixed(2)
                : ''
          }
          placeholder="39.90"
          title="列价为 USDT；前台同时显示 WOLD（见商城→计价）"
        />
      </label>
      <label>
        促销价 USDT（可选）
        <input
          name="salePriceUsdt"
          type="number"
          step="0.01"
          min="0"
          defaultValue={
            product?.salePriceCentsUsd != null
              ? (product.salePriceCentsUsd / 100).toFixed(2)
              : ''
          }
          placeholder="限时价"
        />
      </label>
      <label>
        促销开始
        <input
          name="saleStartsAt"
          type="datetime-local"
          defaultValue={
            product?.saleStartsAt
              ? new Date(product.saleStartsAt).toISOString().slice(0, 16)
              : ''
          }
        />
      </label>
      <label>
        促销结束
        <input
          name="saleEndsAt"
          type="datetime-local"
          defaultValue={
            product?.saleEndsAt ? new Date(product.saleEndsAt).toISOString().slice(0, 16) : ''
          }
        />
      </label>
      {kind === 'combo' ? (
        <p className="full-width muted">
          默认按下方子商品价合计；取消勾选「使用子商品价合计」后，使用上方填写的组合优惠价。
        </p>
      ) : null}
      <label>
        库存（留空=不限）
        <input
          name="stock"
          type="number"
          min="0"
          step="1"
          defaultValue={product?.stock ?? ''}
          placeholder="∞"
        />
      </label>
      <label>
        低库存预警
        <input
          name="lowStockAt"
          type="number"
          min="0"
          step="1"
          defaultValue={product?.lowStockAt ?? ''}
          placeholder="5"
        />
      </label>
      <label>
        Slug（SEO URL，可选）
        <input name="slug" defaultValue={product?.slug ?? ''} placeholder="green-phantom-bracelet" />
      </label>
      <label>
        排序
        <input name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0} />
      </label>
      <label className="checkbox-label">
        <input name="active" type="checkbox" defaultChecked={product?.active ?? true} /> 上架
      </label>
      {kind !== 'combo' ? (
        <label className="checkbox-label">
          <input
            name="requiresShipping"
            type="checkbox"
            defaultChecked={product?.requiresShipping ?? true}
          />{' '}
          需要收货地址（实体发货）
        </label>
      ) : (
        <p className="full-width muted">
          组合商品的发货要求由子商品自动判定（含实体子项则需收货）。
        </p>
      )}
      {kind === 'combo' ? (
        <div className="full-width product-combo-inline">
          <h3 className="product-combo-inline-title">组合子商品</h3>
          <ProductComboEditor product={product} catalog={catalog} />
        </div>
      ) : null}
    </>
  );
}
