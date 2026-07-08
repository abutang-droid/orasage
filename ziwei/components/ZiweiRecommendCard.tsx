'use client';

import { useEffect, useState } from 'react';
import { Button } from '@orasage/ui/button';
import { Card } from '@orasage/ui/card';
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
    <Card className="ziwei-recommend-card border-0 shadow-none" aria-label="商品推荐">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="ziwei-recommend-close"
          onClick={onDismiss}
          aria-label="关闭推荐"
        >
          ×
        </Button>
        <p className="ziwei-recommend-label">为你推荐</p>
        <h3 className="ziwei-recommend-name">{product.name}</h3>
        <p className="ziwei-recommend-desc">{product.desc}</p>
        <div className="ziwei-recommend-foot">
          <span className="ziwei-recommend-price">{product.priceDisplay}</span>
          <Button asChild variant="outline" size="sm" className="ziwei-recommend-link h-auto min-h-0 border-0 bg-transparent p-0 shadow-none">
            <a href={shopUrl} target="_blank" rel="noopener noreferrer">
              去看看
            </a>
          </Button>
        </div>
    </Card>
  );
}
