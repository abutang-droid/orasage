import { isWorldPayEnabled } from '../world-minikit/config';

export type AppCheckoutRequest = {
  sku: string;
  quantity?: number;
  recommendationContext?: string;
  readingId?: string;
  planType?: string;
  shippingMode?: 'single' | 'couple';
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

/** Thrown when /api/checkout returns 401 — callers should send the user to login. */
export class CheckoutAuthRequiredError extends Error {
  readonly status = 401 as const;

  constructor(message = '请先登录') {
    super(message);
    this.name = 'CheckoutAuthRequiredError';
  }
}

export function isCheckoutAuthRequiredError(err: unknown): err is CheckoutAuthRequiredError {
  return err instanceof CheckoutAuthRequiredError;
}

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
    throw new CheckoutAuthRequiredError(
      typeof data.error === 'string' && data.error ? data.error : '请先登录',
    );
  }
  if (!res.ok) {
    throw new Error(data.error || `结账失败 (${res.status})`);
  }
  return data as AppCheckoutResponse;
}

export function shopBaseUrl(): string {
  let apex = 'orasage.com';
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname.toLowerCase();
    if (host === 'oricosmos.com' || host.endsWith('.oricosmos.com')) apex = 'oricosmos.com';
    else if (host === 'orasage.com' || host.endsWith('.orasage.com')) apex = 'orasage.com';
  } else if (typeof process !== 'undefined') {
    const envApex = (
      process.env.NEXT_PUBLIC_SITE_APEX ||
      process.env.SITE_APEX ||
      process.env.NEXT_PUBLIC_SHOP_URL ||
      ''
    )
      .replace(/^https?:\/\//, '')
      .replace(/^\./, '')
      .split('/')[0]
      .trim()
      .toLowerCase();
    if (envApex.includes('oricosmos.com')) apex = 'oricosmos.com';
    else if (envApex.includes('orasage.com') || envApex === 'shop.orasage.com') apex = 'orasage.com';
    else if (envApex.startsWith('shop.')) apex = envApex.slice('shop.'.length);
  }
  if (typeof process !== 'undefined') {
    const fromEnv = (process.env.NEXT_PUBLIC_SHOP_URL || process.env.SHOP_URL || '').replace(/\/$/, '');
    if (fromEnv) return fromEnv;
  }
  return `https://shop.${apex}`;
}

function shopCheckoutFallbackUrl(orderNo: string): string {
  return `${shopBaseUrl()}/checkout?order=${encodeURIComponent(orderNo)}`;
}

export function shouldCompleteWithWorldPay(result: AppCheckoutResponse): boolean {
  if (result.provider === 'world' || result.provider === 'wld' || result.provider === 'minikit') {
    return true;
  }
  return isWorldPayEnabled();
}

/**
 * Default redirect (mock / Stripe). Tarot overrides with World MiniKit.pay.
 */
export async function redirectAfterCheckout(
  result: AppCheckoutResponse,
  _opts?: { successUrl?: string },
): Promise<void> {
  if (result.checkoutUrl) {
    window.location.href = result.checkoutUrl;
    return;
  }
  if (result.orderNo) {
    window.location.href = shopCheckoutFallbackUrl(result.orderNo);
    return;
  }
  throw new Error('结账链接生成失败，请稍后重试');
}

export function isMockCheckoutProvider(provider: string): boolean {
  return provider === 'mock' || provider === 'demo';
}

export function isWorldCheckoutProvider(provider: string): boolean {
  return provider === 'world' || provider === 'wld' || provider === 'minikit';
}
