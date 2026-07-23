'use client';

import { useEffect, useState } from 'react';
import { Button } from '@orasage/ui/button';
import { startAppCheckout } from '@/lib/shop-checkout';
import {
  fetchZiweiChatProducts,
  type ZiweiChatProduct,
  type ZiweiChatQuota,
} from '@/lib/ziwei-chat-client';
import { formToSearchParams } from '@/lib/ziwei/share';
import { loadChartSession } from '@/lib/ziwei-reading-session';

type Props = {
  readingId: string;
  quota: ZiweiChatQuota | null;
  onPurchased?: () => void;
};

function buildPaidReturnUrl(readingId: string): string {
  const session = loadChartSession();
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://ziwei.orasage.com';
  if (session?.form?.year) {
    const params = formToSearchParams(session.form, {
      readingId,
      mode: session.mode === 'heming' ? 'heming' : undefined,
    });
    params.set('paid', '1');
    params.set('focus', 'chat');
    return `${base}/chart?${params.toString()}`;
  }
  return `${base}/chart?rid=${encodeURIComponent(readingId)}&paid=1&focus=chat`;
}

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
      const returnBase = buildPaidReturnUrl(readingId);
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
        {quota && quota.freeRemaining <= 0 && quota.packCredits > 0
          ? `加量包余额 ${quota.packCredits} 次已用尽。`
          : `本盘免费 ${quota?.freePerReading ?? 5} 次已用尽。`}
        选择方案继续向 Orasage 提问：
      </p>
      {products.length ? (
        <div className="ziwei-chat-paywall-plans">
          {products.map((plan) => (
            <Button
              key={plan.sku}
              type="button"
              variant="outline"
              className={`ziwei-chat-plan${plan.type === 'yearly' ? ' is-featured' : ''}`}
              disabled={Boolean(loadingSku)}
              loading={loadingSku === plan.sku}
              onClick={() => void handlePay(plan.sku)}
            >
              <div>
                <strong>{plan.name}</strong>
                <span>{plan.desc}</span>
              </div>
              <em>{plan.priceDisplay}</em>
            </Button>
          ))}
        </div>
      ) : (
        <p className="ziwei-brief-muted">加量方案暂未开放，请稍后再试或联系客服。</p>
      )}
      {error ? <p className="ziwei-brief-error">{error}</p> : null}
      {loadingSku ? <p className="ziwei-brief-muted">正在跳转结账…</p> : null}
    </div>
  );
}
