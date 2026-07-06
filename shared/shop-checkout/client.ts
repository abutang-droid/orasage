export type AppCheckoutRequest = {
  sku: string;
  quantity?: number;
  recommendationContext?: string;
  readingId?: string;
  planType?: string;
  shippingMode?: 'single' | 'couple';
  successUrl?: string;
  cancelUrl?: string;
  /** 乐捐等可变价 SKU（美分，USD） */
  priceCentsUsd?: number;
};

export type AppCheckoutResponse = {
  orderNo: string;
  checkoutUrl?: string | null;
  provider: string;
  amountCents?: number;
  title?: string;
};

/** 各命理 App 前端调用本 App 的 /api/checkout 代理 */
export async function startAppCheckout(body: AppCheckoutRequest): Promise<AppCheckoutResponse> {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    throw new Error(data.error || '请先完成邮箱验证');
  }
  if (!res.ok) {
    throw new Error(data.error || `结账失败 (${res.status})`);
  }
  return data as AppCheckoutResponse;
}

/** 根据结账结果跳转 Stripe 或模拟支付页 */
export function redirectAfterCheckout(result: AppCheckoutResponse) {
  if (result.checkoutUrl) {
    window.location.href = result.checkoutUrl;
    return;
  }
  if (result.orderNo) {
    window.location.href = `https://shop.orasage.com/checkout?order=${encodeURIComponent(result.orderNo)}`;
  }
}

export function isMockCheckoutProvider(provider: string): boolean {
  return provider === 'mock' || provider === 'demo';
}
