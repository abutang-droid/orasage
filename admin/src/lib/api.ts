import { cookies } from 'next/headers';
import { ENV } from './env';

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const jar = await cookies();
  const token = jar.get(ENV.jwtCookieName)?.value;
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Cookie', `${ENV.jwtCookieName}=${token}`);
  }
  headers.set('Content-Type', 'application/json');

  const res = await fetch(`${ENV.authUrl}/api/admin${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `请求失败 (${res.status})`);
  }
  return data as T;
}

export interface AdminStats {
  users: number;
  orders: number;
  readings: number;
  products: number;
}

export interface AdminProduct {
  id: number;
  sku: string;
  name: string;
  element?: string | null;
  desc: string;
  priceCents: number;
  priceDisplay: string;
  category: 'crystal' | 'report' | 'service';
  categoryLabel: string;
  active: boolean;
  sortOrder: number;
  shopUrl: string;
}

export interface AdminOrder {
  id: number;
  userId: number;
  orderNo: string;
  title: string;
  sku?: string | null;
  amountCents: number;
  amountDisplay: string;
  status: string;
  statusLabel: string;
  appSource?: string | null;
  appLabel?: string | null;
  createdAt: string;
}

export function getStats() {
  return adminFetch<AdminStats>('/stats');
}

export function getProducts() {
  return adminFetch<{ products: AdminProduct[] }>('/products');
}

export function getOrders() {
  return adminFetch<{ orders: AdminOrder[] }>('/orders');
}

export function createProduct(body: Record<string, unknown>) {
  return adminFetch<{ product: AdminProduct }>('/products', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateProduct(sku: string, body: Record<string, unknown>) {
  return adminFetch<{ product: AdminProduct }>(`/products/${encodeURIComponent(sku)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function updateOrderStatus(orderNo: string, status: string) {
  return adminFetch<{ success: boolean }>(`/orders/${encodeURIComponent(orderNo)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
