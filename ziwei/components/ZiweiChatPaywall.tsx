'use client';

import { useEffect, useState } from 'react';
import { startAppCheckout } from '@/lib/shop-checkout';
import {
  fetchZiweiChatProducts,
  type ZiweiChatProduct,
  type ZiweiChatQuota,
} from '@/lib/ziwei-chat-client';

type Props = {
  readingId: string;
  quota: ZiweiChatQuota | null;
  onPurchased?: () => void;
};

export function ZiweiChatPaywall({ readingId, quota, onPurchased }: Props) {
  const [products, setProducts] = useState<ZiweiChatProduct[]>([]);
  const [loadingSku, setLoadingSku] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void fetchZiweiChatProducts().then(setProducts);
  }, []);

  const handlePay = async (sku: string) => {
    setLoadingSku(sku);
    setError('');
    try {
      const returnBase = `${window.location.origin}/chart?paid=1`;
      const result = await startAppCheckout({
        sku,
        readingId,
        recommendationContext: '紫微 Orasage 问答',
        successUrl: returnBase,
      });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      const returnUrl = encodeURIComponent(`${returnBase}&order=${encodeURIComponent(result.orderNo)}`);
      window.location.href = `https://shop.orasage.com/checkout?order=${encodeURIComponent(result.orderNo)}&return=${returnUrl}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : '结账失败');
      setLoadingSku(null);
    }
  };

  return (
    <div className="ziwei-chat-paywall">
      <p className="ziwei-chat-paywall-title">问答次数已用完</p>
      <p className="ziwei-chat-paywall-sub">
        本盘免费 {quota?.freePerReading ?? 5} 次已用尽
        {quota && quota.packCredits > 0 ? `，账户加量余额 ${quota.packCredits} 次` : ''}
        。选择方案继续向 Orasage 提问：
      </p>
      <div className="ziwei-chat-paywall-plans">
        {products.map((plan) => (
          <button
            key={plan.sku}
            type="button"
            className={`ziwei-chat-plan${plan.type === 'yearly' ? ' is-featured' : ''}`}
            disabled={Boolean(loadingSku)}
            onClick={() => void handlePay(plan.sku)}
          >
            <div>
              <strong>{plan.name}</strong>
              <span>{plan.desc}</span>
            </div>
            <em>{plan.priceDisplay}</em>
          </button>
        ))}
      </div>
      {error ? <p className="ziwei-brief-error">{error}</p> : null}
      {loadingSku ? <p className="ziwei-brief-muted">正在跳转结账…</p> : null}
    </div>
  );
}
