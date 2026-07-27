import type { CSSProperties, ReactNode } from 'react';
import {
  dualShopPriceParts,
  parsePriceDisplay,
  type ProductPricing,
  type ParsedPricePart,
} from './index';

type PriceDisplayProps = {
  /** API / 计费返回的展示串，如 `39.90 U / 39.90 W` */
  value?: string | null;
  /** 直接传分价（优先于 value） */
  pricing?: ProductPricing | number | null;
  className?: string;
  style?: CSSProperties;
  /** 无价格时的占位 */
  fallback?: ReactNode;
};

function PartView({ part }: { part: ParsedPricePart }) {
  return (
    <span className="os-price-part">
      <span className="os-price-amount">{part.amount}</span>
      <span className="os-price-unit">{part.unit}</span>
    </span>
  );
}

/** 全站价格：蓝色金额 + 缩小单位 U/W */
export function PriceDisplay({
  value,
  pricing,
  className = '',
  style,
  fallback = null,
}: PriceDisplayProps) {
  let parts: ParsedPricePart[] | null = null;

  if (pricing != null) {
    const dual = dualShopPriceParts(pricing);
    parts = dual.parts;
  } else if (value?.trim()) {
    parts = parsePriceDisplay(value);
  }

  if (!parts?.length) {
    if (value?.trim()) {
      return (
        <span className={`os-price ${className}`.trim()} style={style}>
          {value}
        </span>
      );
    }
    return <>{fallback}</>;
  }

  return (
    <span className={`os-price ${className}`.trim()} style={style}>
      {parts.map((part, i) => (
        <span key={`${part.unit}-${part.amount}-${i}`}>
          {i > 0 ? <span className="os-price-sep">/</span> : null}
          <PartView part={part} />
        </span>
      ))}
    </span>
  );
}
