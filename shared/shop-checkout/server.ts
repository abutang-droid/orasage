const AUTH_INTERNAL =
  (typeof process !== 'undefined' && process.env.AUTH_INTERNAL_URL) ||
  'http://127.0.0.1:3101';

const SHOP_INTERNAL =
  (typeof process !== 'undefined' && process.env.SHOP_INTERNAL_URL) ||
  'http://127.0.0.1:3102';

export type AppCheckoutSource = 'bazi' | 'ziwei' | 'tarot' | 'shop';

export type AppCheckoutInput = {
  userId: number;
  sku: string;
  quantity?: number;
  appSource: AppCheckoutSource;
  recommendationContext?: string;
  readingId?: string;
  successUrl?: string;
  cancelUrl?: string;
};

export type CheckoutResult = {
  orderNo: string;
  checkoutUrl?: string | null;
  provider: string;
  amountCents?: number;
  title?: string;
};

/** 从 orasage_token cookie 解析 auth 用户 ID（供各 App 服务端代理使用） */
export async function resolveAuthUserId(cookieHeader: string | null): Promise<number | null> {
  if (!cookieHeader) return null;
  try {
    const res = await fetch(`${AUTH_INTERNAL}/verify`, {
      headers: { cookie: cookieHeader },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const id = Number(data.sub);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

/** 内网调用 shop 结账 API */
export async function proxyShopCheckout(input: AppCheckoutInput): Promise<CheckoutResult> {
  const res = await fetch(`${SHOP_INTERNAL}/api/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-real-ip': '127.0.0.1',
    },
    body: JSON.stringify({
      userId: input.userId,
      items: [{ sku: input.sku, quantity: input.quantity ?? 1 }],
      appSource: input.appSource,
      recommendationContext: input.recommendationContext,
      readingId: input.readingId,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `checkout failed (${res.status})`);
  }
  return data as CheckoutResult;
}
