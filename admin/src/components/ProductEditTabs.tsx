'use client';

import { useState, type ReactNode } from 'react';

export type ProductEditTab = 'basic' | 'combo' | 'attributes' | 'tags' | 'i18n' | 'media' | 'attachments';

const TABS: Array<{ id: ProductEditTab; label: string }> = [
  { id: 'basic', label: '基础信息' },
  { id: 'combo', label: '组合' },
  { id: 'attributes', label: '属性规格' },
  { id: 'tags', label: '标签' },
  { id: 'i18n', label: '多语言' },
  { id: 'media', label: '媒体与 CMS' },
  { id: 'attachments', label: '附件' },
];

type ProductEditTabsProps = {
  panels: Record<ProductEditTab, ReactNode>;
};

export function ProductEditTabs({ panels }: ProductEditTabsProps) {
  const [active, setActive] = useState<ProductEditTab>('basic');

  return (
    <div className="product-edit-tabs">
      <div className="product-edit-tablist" role="tablist" aria-label="商品编辑分区">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={`product-edit-tab${active === tab.id ? ' is-active' : ''}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {TABS.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          className="product-edit-tabpanel"
          hidden={active !== tab.id}
        >
          {panels[tab.id]}
        </div>
      ))}
    </div>
  );
}
