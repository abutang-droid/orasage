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
  material?: string | null;
  color?: string | null;
  packaging?: string | null;
  weightGrams?: number | null;
  beadDiameterMm?: number | null;
  wristCmMin?: number | null;
  wristCmMax?: number | null;
  lengthMm?: number | null;
  attachments?: Array<{ name: string; url: string }> | null;
  desc: string;
  nameI18n?: Record<string, string> | null;
  descriptionI18n?: Record<string, string> | null;
  materialI18n?: Record<string, string> | null;
  colorI18n?: Record<string, string> | null;
  packagingI18n?: Record<string, string> | null;
  priceCents: number;
  priceCentsUsd?: number | null;
  priceDisplay: string;
  priceDisplayCny?: string;
  priceDisplayUsd?: string;
  category: 'crystal' | 'report' | 'service';
  categoryLabel: string;
  requiresShipping: boolean;
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
  shippingAddress?: string | null;
  recommendationContext?: string | null;
  createdAt: string;
  shipments?: AdminShipment[];
}

export interface AdminShipment {
  id: number;
  carrier: string;
  trackingNo: string;
  status: string;
  shippedAt?: string | null;
  events: Array<{
    status: string;
    description: string;
    location?: string | null;
    occurredAt: string;
  }>;
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

/** since 之后创建的订单数（后台导航角标用） */
export function getNewOrdersCount(since?: string) {
  const query = since ? `?since=${encodeURIComponent(since)}` : '';
  return adminFetch<{ count: number; since: string }>(`/orders/new-count${query}`);
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

export interface AdminContactMessage {
  id: number;
  userId: number | null;
  name: string;
  email: string;
  subject: string | null;
  body: string;
  locale: string | null;
  status: 'new' | 'processing' | 'resolved';
  statusLabel: string;
  adminNote: string | null;
  handledBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export function getContactMessages(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return adminFetch<{ messages: AdminContactMessage[] }>(`/contact-messages${query}`);
}

export function updateContactMessage(id: number, body: { status?: string; adminNote?: string }) {
  return adminFetch<{ success: boolean }>(`/contact-messages/${id}`, {
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

export function createOrderShipment(orderNo: string, body: { carrier: string; trackingNo: string; note?: string }) {
  return adminFetch<{ success: boolean; shipment: AdminShipment | null }>(
    `/orders/${encodeURIComponent(orderNo)}/shipments`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

export interface HomepageProductsConfig {
  skus: string[];
  products: AdminProduct[];
  categories: Array<{ id: 'crystal' | 'report' | 'service'; label: string }>;
}

export function getHomepageProducts() {
  return adminFetch<HomepageProductsConfig>('/homepage-products');
}

export function saveHomepageProducts(skus: string[]) {
  return adminFetch<HomepageProductsConfig>('/homepage-products', {
    method: 'PUT',
    body: JSON.stringify({ skus }),
  });
}

export interface BaziRecommendProductsConfig {
  elements: string[];
  skuMap: Record<string, string>;
  priceOverrides: Record<string, { priceCents: number | null; priceCentsUsd: number | null }>;
  recommendations: Record<string, AdminProduct | null>;
}

export function getBaziRecommendProducts() {
  return adminFetch<BaziRecommendProductsConfig>('/bazi-recommend-products');
}

export function saveBaziRecommendProducts(items: Record<string, {
  sku: string;
  priceCents?: number | null;
  priceCentsUsd?: number | null;
}>) {
  return adminFetch<BaziRecommendProductsConfig>('/bazi-recommend-products', {
    method: 'PUT',
    body: JSON.stringify({ items }),
  });
}

export interface ZiweiRecommendProductsConfig {
  skus: string[];
  rows: Array<{ id: number; sku: string; sortOrder: number; active: boolean }>;
}

export function getZiweiRecommendProducts() {
  return adminFetch<ZiweiRecommendProductsConfig>('/ziwei-recommend-products');
}

export function saveZiweiRecommendProducts(skus: string[]) {
  return adminFetch<ZiweiRecommendProductsConfig>('/ziwei-recommend-products', {
    method: 'PUT',
    body: JSON.stringify({ skus }),
  });
}

export interface TarotBillingConfig {
  dailyOverageSku: string;
  threeCardReportSku: string;
  threeCardBundleSku: string;
  recommendSkus: string[];
  recommendRows: Array<{ id: number; sku: string; sortOrder: number; active: boolean }>;
}

export function getTarotBillingConfig() {
  return adminFetch<TarotBillingConfig>('/tarot-billing-config');
}

export function saveTarotBillingSkus(input: {
  dailyOverageSku: string;
  threeCardReportSku: string;
  threeCardBundleSku: string;
}) {
  return adminFetch<{ skus: Pick<TarotBillingConfig, 'dailyOverageSku' | 'threeCardReportSku' | 'threeCardBundleSku'> }>(
    '/tarot-billing-config',
    { method: 'PUT', body: JSON.stringify(input) },
  );
}

export function saveTarotDailyRecommendProducts(skus: string[]) {
  return adminFetch<{ skus: string[]; rows: TarotBillingConfig['recommendRows'] }>(
    '/tarot-daily-recommend-products',
    { method: 'PUT', body: JSON.stringify({ skus }) },
  );
}

/* ── 共振定制（DIY）珠子与配置 ─────────────────────── */

export interface AdminDiyBead {
  code: string;
  name: string;
  element?: string | null;
  material: string;
  type: 'crystal' | 'spacer' | 'disc';
  diameterMm: number;
  thicknessMm?: number | null;
  lengthMm: number;
  priceCents: number;
  priceCentsUsd?: number | null;
  imageUrl?: string | null;
  colors?: string | null;
  stock: number;
  active: boolean;
  sortOrder: number;
}

export interface AdminDiyConfig {
  lengthCorrectionMm: number;
  minOrderCents: number;
  fitToleranceMm: number;
  wristEaseMm: number;
}

export function getDiyBeads() {
  return adminFetch<{ beads: AdminDiyBead[] }>('/diy/beads');
}

export function createDiyBead(body: Record<string, unknown>) {
  return adminFetch<{ bead: AdminDiyBead }>('/diy/beads', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateDiyBead(code: string, body: Record<string, unknown>) {
  return adminFetch<{ bead: AdminDiyBead }>(`/diy/beads/${encodeURIComponent(code)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function getDiyConfig() {
  return adminFetch<{ config: AdminDiyConfig }>('/diy/config');
}

export function saveDiyConfig(body: AdminDiyConfig) {
  return adminFetch<{ config: AdminDiyConfig }>('/diy/config', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}
