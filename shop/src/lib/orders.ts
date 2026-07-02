import { ENV } from './env';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
export type AppSource = 'bazi' | 'ziwei' | 'tarot' | 'shop';

export interface SyncOrderInput {
  userId: number;
  orderNo: string;
  title: string;
  amountCents: number;
  currency?: string;
  status?: OrderStatus;
  appSource?: AppSource;
  sku?: string;
  recommendationContext?: string;
  readingId?: string;
}

export function makeOrderNo() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `OS-${ts}-${rand}`;
}

export async function syncOrderToAuth(input: SyncOrderInput) {
  const res = await fetch(`${ENV.authInternalUrl}/internal/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `同步订单失败 (${res.status})`);
  }
  return data as { success: boolean; id: number; duplicate?: boolean; updated?: boolean };
}

export interface AuthOrder {
  id: number;
  userId: number;
  orderNo: string;
  title: string;
  amountCents: number;
  currency: string;
  status: OrderStatus;
  appSource: AppSource | null;
  sku?: string | null;
  readingId?: string | null;
  recommendationContext?: string | null;
}

export async function getOrderByNo(orderNo: string): Promise<AuthOrder | null> {
  const res = await fetch(`${ENV.authInternalUrl}/internal/orders/${encodeURIComponent(orderNo)}`, {
    method: 'GET',
  });
  if (res.status === 404) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `查询订单失败 (${res.status})`);
  }
  return data.order as AuthOrder;
}

export async function updateOrderStatus(orderNo: string, status: OrderStatus) {
  const res = await fetch(`${ENV.authInternalUrl}/internal/orders/${encodeURIComponent(orderNo)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `更新订单失败 (${res.status})`);
  }
  return data as { success: boolean; orderNo: string; status: OrderStatus };
}
