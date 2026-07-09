'use client';

import { useState, type ReactNode } from 'react';

const KIND_OPTIONS = [
  { value: 'standard', label: '实体商品' },
  { value: 'digital', label: '数字商品（报告等）' },
  { value: 'service', label: '服务' },
  { value: 'diy', label: 'DIY 定制' },
  { value: 'combo', label: '组合商品（数字+实体等）' },
] as const;

type ProductKindSelectProps = {
  defaultKind?: string;
  children: (kind: string) => ReactNode;
};

export function ProductKindSelect({ defaultKind = 'standard', children }: ProductKindSelectProps) {
  const [kind, setKind] = useState(defaultKind);
  return (
    <>
      <label>
        形态
        <select name="kind" value={kind} onChange={(e) => setKind(e.target.value)}>
          {KIND_OPTIONS.map((k) => (
            <option key={k.value} value={k.value}>{k.label}</option>
          ))}
        </select>
      </label>
      {children(kind)}
    </>
  );
}
