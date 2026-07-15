'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@orasage/ui/button';
import { Card } from '@orasage/ui/card';
import { fetchZiweiRecommendProduct, type RecommendProduct } from '@/lib/ziwei-chat-client';
import type { ZiweiChart } from '@/lib/ziwei/types';
import { useT } from '@/lib/i18n';

type Props = {
  chart: ZiweiChart;
  sessionKey: string;
  dismissed: boolean;
  onDismiss: () => void;
};

export function ZiweiRecommendCard({ chart, sessionKey, dismissed, onDismiss }: Props) {
  const t = useT();
  const [product, setProduct] = useState<RecommendProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const next = await fetchZiweiRecommendProduct(chart);
      setProduct(next);
      if (!next) setError('');
    } catch (e) {
      setProduct(null);
      setError(e instanceof Error ? e.message : t('recommend.error'));
    } finally {
      setLoading(false);
    }
  }, [chart, t]);

  useEffect(() => {
    if (dismissed) return;
    void load();
  }, [chart, sessionKey, dismissed, retryKey, load]);

  if (dismissed) return null;

  const shopUrl = product
    ? `https://shop.orasage.com/product/${encodeURIComponent(product.sku)}`
    : '';

  return (
    <Card
      className="ziwei-recommend-card border-0 shadow-none"
      aria-label="商品推荐"
      aria-busy={loading || undefined}
    >
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
      <div className="ziwei-recommend-slot">
        {loading ? (
          <p className="ziwei-recommend-label" role="status" aria-live="polite">
            {t('recommend.loading')}
          </p>
        ) : error ? (
          <div role="alert">
            <p className="ziwei-recommend-desc">{error || t('recommend.error')}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setRetryKey((k) => k + 1)}
            >
              {t('recommend.retry')}
            </Button>
          </div>
        ) : !product ? (
          <p className="ziwei-recommend-desc">{t('recommend.empty')}</p>
        ) : (
          <>
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
          </>
        )}
      </div>
    </Card>
  );
}
