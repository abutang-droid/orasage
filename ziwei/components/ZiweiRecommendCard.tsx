'use client';

import { useEffect, useState } from 'react';
import { fetchZiweiRecommendProduct, type RecommendProduct } from '@/lib/ziwei-chat-client';

type Props = {
  readingId: string;
  sessionKey: string;
  dismissed: boolean;
  onDismiss: () => void;
};

export function ZiweiRecommendCard({ readingId, sessionKey, dismissed, onDismiss }: Props) {
  const [product, setProduct] = useState<RecommendProduct | null>(null);

  useEffect(() => {
    if (dismissed) return;
    void fetchZiweiRecommendProduct(readingId).then(setProduct);
  }, [readingId, sessionKey, dismissed]);

  if (dismissed || !product) return null;

  const shopUrl = `https://shop.orasage.com/product/${encodeURIComponent(product.sku)}`;

  return (
    <aside className="ziwei-recommend-card" aria-label="商品推荐">
      <button type="button" className="ziwei-recommend-close" onClick={onDismiss} aria-label="关闭推荐">
        ×
      </button>
      <p className="ziwei-recommend-label">为你推荐</p>
      <h3 className="ziwei-recommend-name">{product.name}</h3>
      <p className="ziwei-recommend-desc">{product.desc}</p>
      <div className="ziwei-recommend-foot">
        <span className="ziwei-recommend-price">{product.priceDisplay}</span>
        <a href={shopUrl} className="ziwei-recommend-link" target="_blank" rel="noopener noreferrer">
          去看看
        </a>
      </div>
    </aside>
  );
}
