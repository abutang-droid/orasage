'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { AdminProduct } from '@/lib/api';
import { batchSetProductsActiveAction } from '@/app/actions';
import { AdminSubmitButton } from './AdminButton';
import { ProductImageCell } from './ProductImageCell';
import { ProductCmsLinks } from './ProductCmsLinks';

const KIND_LABELS: Record<string, string> = {
  standard: '实体',
  digital: '数字',
  service: '服务',
  diy: '定制',
  combo: '组合',
};

const VISIBILITY_LABELS: Record<string, string> = {
  public: '公开',
  unlisted: '仅直链',
  app_only: '仅计费',
};

const I18N_LOCALES = ['en', 'pt-BR'] as const;

type ProductRowData = AdminProduct & {
  imageUrl?: string | null;
  pageStatus: 'published' | 'draft' | 'none';
};

function missingNameLocales(p: AdminProduct): string[] {
  const missing: string[] = [];
  if (!p.name?.trim()) missing.push('zh-CN');
  for (const loc of I18N_LOCALES) {
    if (!p.nameI18n?.[loc]?.trim()) missing.push(loc);
  }
  return missing;
}

function escapeCsv(value: string | number | boolean | null | undefined): string {
  const text = value == null ? '' : String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function downloadCsv(filename: string, rows: ProductRowData[]) {
  const header = [
    'sku', 'name', 'category', 'kind', 'visibility', 'stock', 'price_usdt', 'active', 'tags',
  ];
  const lines = rows.map((p) => [
    p.sku,
    p.name,
    p.category,
    p.kind,
    p.visibility,
    p.stock ?? '',
    p.priceCentsUsd != null ? p.priceCentsUsd / 100 : '',
    p.active ? '1' : '0',
    (p.tags ?? []).map((t) => t.label).join('|'),
  ].map(escapeCsv).join(','));
  const blob = new Blob(['\ufeff' + [header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ProductListTable({ products }: { products: ProductRowData[] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [kind, setKind] = useState('');
  const [visibility, setVisibility] = useState('');
  const [tag, setTag] = useState('');
  const [status, setStatus] = useState('');
  const [i18nGap, setI18nGap] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

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
      if (i18nGap === 'missing' && missingNameLocales(p).length === 0) return false;
      if (i18nGap && i18nGap !== 'missing' && !missingNameLocales(p).includes(i18nGap)) return false;
      return true;
    });
  }, [products, search, category, kind, visibility, tag, status, i18nGap]);

  const filteredSkus = useMemo(() => new Set(filtered.map((p) => p.sku)), [filtered]);
  const selectedInView = [...selected].filter((sku) => filteredSkus.has(sku));
  const allFilteredSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.sku));

  const toggleAllFiltered = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filtered.forEach((p) => next.delete(p.sku));
      } else {
        filtered.forEach((p) => next.add(p.sku));
      }
      return next;
    });
  };

  const toggleOne = (sku: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(sku)) next.delete(sku);
      else next.add(sku);
      return next;
    });
  };

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
        <select value={i18nGap} onChange={(e) => setI18nGap(e.target.value)}>
          <option value="">全部语言</option>
          <option value="missing">缺任意语言名称</option>
          <option value="en">缺英文名称</option>
          <option value="pt-BR">缺葡语名称</option>
        </select>
        <span className="muted">{filtered.length} / {products.length}</span>
      </div>

      <div className="product-list-toolbar">
        <form action={batchSetProductsActiveAction} className="product-list-batch-form">
          <input type="hidden" name="skus" value={selectedInView.join(',')} />
          <input type="hidden" name="active" value="1" />
          <AdminSubmitButton size="sm" disabled={selectedInView.length === 0}>
            批量上架 ({selectedInView.length})
          </AdminSubmitButton>
        </form>
        <form action={batchSetProductsActiveAction} className="product-list-batch-form">
          <input type="hidden" name="skus" value={selectedInView.join(',')} />
          <input type="hidden" name="active" value="0" />
          <AdminSubmitButton size="sm" variant="secondary" disabled={selectedInView.length === 0}>
            批量下架
          </AdminSubmitButton>
        </form>
        <button
          type="button"
          className="btn-secondary btn-secondary--sm"
          onClick={() => downloadCsv(`products-${new Date().toISOString().slice(0, 10)}.csv`, filtered)}
        >
          导出 CSV ({filtered.length})
        </button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="product-list-check-col">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleAllFiltered}
                  aria-label="全选当前筛选结果"
                />
              </th>
              <th>主图</th>
              <th>SKU</th>
              <th>名称</th>
              <th>语言</th>
              <th>标签</th>
              <th>分类</th>
              <th>形态</th>
              <th>可见性</th>
              <th>库存</th>
              <th>USDT</th>
              <th>状态</th>
              <th>详情页</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const missing = missingNameLocales(p);
              return (
                <tr key={p.sku}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(p.sku)}
                      onChange={() => toggleOne(p.sku)}
                      aria-label={`选择 ${p.sku}`}
                    />
                  </td>
                  <td><ProductImageCell imageUrl={p.imageUrl} /></td>
                  <td><code>{p.sku}</code></td>
                  <td>{p.name}</td>
                  <td>
                    {missing.length === 0 ? (
                      <span className="badge ok">4语</span>
                    ) : (
                      <span className="badge off" title={`缺：${missing.join(', ')}`}>
                        缺 {missing.join(', ')}
                      </span>
                    )}
                  </td>
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
                  <td>
                    {p.priceCentsUsd != null
                      ? (p.priceCentsUsd / 100).toFixed(2)
                      : (p.priceDisplayUsd ?? p.priceDisplay ?? '—')}
                  </td>
                  <td>{p.active ? <span className="badge ok">上架</span> : <span className="badge off">下架</span>}</td>
                  <td><ProductCmsLinks sku={p.sku} pageStatus={p.pageStatus} /></td>
                  <td>
                    <Link href={`/products/${encodeURIComponent(p.sku)}/edit`} className="btn-text">
                      编辑
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
