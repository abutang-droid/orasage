export type AppCheckoutRequest = {
  sku: string;
  quantity?: number;
  recommendationContext?: string;
  readingId?: string;
  planType?: string;
  successUrl?: string;
  cancelUrl?: string;
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
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.orasage.com';
    const redirect = encodeURIComponent(window.location.href);
    window.location.href = `${authUrl}/login?redirect=${redirect}`;
    throw new Error('请先登录');
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
