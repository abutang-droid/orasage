'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { AdminProduct } from '@/lib/api';
import { ProductImageCell } from './ProductImageCell';
import { ProductCmsLinks } from './ProductCmsLinks';

const KIND_LABELS: Record<string, string> = {
  standard: '实体',
  digital: '数字',
  service: '服务',
  diy: '定制',
};

const VISIBILITY_LABELS: Record<string, string> = {
  public: '公开',
  unlisted: '仅直链',
  app_only: '仅计费',
};

type ProductRowData = AdminProduct & {
  imageUrl?: string | null;
  pageStatus: 'published' | 'draft' | 'none';
};

export function ProductListTable({ products }: { products: ProductRowData[] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [kind, setKind] = useState('');
  const [visibility, setVisibility] = useState('');
  const [tag, setTag] = useState('');
  const [status, setStatus] = useState('');

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [products],
  );
  const allTags = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      for (const t of p.tags ?? []) map.set(t.code, t.label);
    }
    return [...map.entries()];
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.sku.toLowerCase().includes(q) && !p.name.toLowerCase().includes(q)) return false;
      if (category && p.category !== category) return false;
      if (kind && p.kind !== kind) return false;
      if (visibility && p.visibility !== visibility) return false;
      if (tag && !(p.tags ?? []).some((t) => t.code === tag)) return false;
      if (status === 'active' && !p.active) return false;
      if (status === 'inactive' && p.active) return false;
      if (status === 'lowstock' && !(p.stock != null && p.lowStockAt != null && p.stock <= p.lowStockAt)) return false;
      return true;
    });
  }, [products, search, category, kind, visibility, tag, status]);

  return (
    <>
      <div className="product-list-filters">
        <input
          type="search"
          placeholder="搜索 SKU / 名称"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">全部分类</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="">全部形态</option>
          {Object.entries(KIND_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
          <option value="">全部可见性</option>
          {Object.entries(VISIBILITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">全部标签</option>
          {allTags.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">全部状态</option>
          <option value="active">上架</option>
          <option value="inactive">下架</option>
          <option value="lowstock">低库存</option>
        </select>
        <span className="muted">{filtered.length} / {products.length}</span>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>主图</th>
              <th>SKU</th>
              <th>名称</th>
              <th>标签</th>
              <th>分类</th>
              <th>形态</th>
              <th>可见性</th>
              <th>库存</th>
              <th>价格 CNY</th>
              <th>价格 USD</th>
              <th>状态</th>
              <th>详情页</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.sku}>
                <td><ProductImageCell imageUrl={p.imageUrl} /></td>
                <td><code>{p.sku}</code></td>
                <td>{p.name}</td>
                <td>
                  <span className="product-tag-cell">
                    {(p.tags ?? []).map((t) => (
                      <span key={t.code} className="badge">{t.label}</span>
                    ))}
                  </span>
                </td>
                <td>{p.categoryLabel}</td>
                <td>{KIND_LABELS[p.kind] ?? p.kind}</td>
                <td>
                  <span className={`badge${p.visibility === 'public' ? ' ok' : p.visibility === 'app_only' ? ' off' : ''}`}>
                    {VISIBILITY_LABELS[p.visibility] ?? p.visibility}
                  </span>
                </td>
                <td>
                  {p.stock == null
                    ? '∞'
                    : p.lowStockAt != null && p.stock <= p.lowStockAt
                      ? <span className="badge off">{p.stock}</span>
                      : p.stock}
                </td>
                <td>{p.priceDisplayCny ?? p.priceDisplay}</td>
                <td>{p.priceDisplayUsd ?? '—'}</td>
                <td>{p.active ? <span className="badge ok">上架</span> : <span className="badge off">下架</span>}</td>
                <td><ProductCmsLinks sku={p.sku} pageStatus={p.pageStatus} /></td>
                <td>
                  <Link href={`/products/${encodeURIComponent(p.sku)}/edit`} className="btn-text">
                    编辑
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
