import { cookies } from 'next/headers';
import { ENV } from './env';

export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
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
  seoTitleI18n?: Record<string, string> | null;
  seoDescI18n?: Record<string, string> | null;
  priceCents: number;
  priceCentsUsd?: number | null;
  priceDisplay: string;
  priceDisplayCny?: string;
  priceDisplayUsd?: string;
  category: string;
  categoryLabel: string;
  kind: 'standard' | 'digital' | 'service' | 'diy' | 'combo';
  visibility: 'public' | 'unlisted' | 'app_only';
  comboUseComponentSum?: boolean;
  comboComponentSumCents?: number;
  comboComponentSumUsdCents?: number | null;
  comboItems?: Array<{
    componentSku: string;
    quantity: number;
    role?: 'fixed' | 'element_crystal';
    name: string;
    kind: string;
    category: string;
    priceCents: number;
    priceCentsUsd?: number | null;
    requiresShipping: boolean;
    requiresWristSize: boolean;
  }>;
  stock?: number | null;
  lowStockAt?: number | null;
  slug?: string | null;
  tags: Array<{ id: number; code: string; label: string; groupCode: string }>;
  requiresShipping: boolean;
  active: boolean;
  sortOrder: number;
  shopUrl: string;
  salePriceCents?: number | null;
  salePriceCentsUsd?: number | null;
  saleStartsAt?: string | null;
  saleEndsAt?: string | null;
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

export function getOrders(params?: {
  status?: string;
  app?: string;
  q?: string;
  offset?: number;
  limit?: number;
}) {
  const sp = new URLSearchParams();
  if (params?.status) sp.set('status', params.status);
  if (params?.app) sp.set('app', params.app);
  if (params?.q) sp.set('q', params.q);
  if (params?.offset != null) sp.set('offset', String(params.offset));
  if (params?.limit != null) sp.set('limit', String(params.limit));
  const qs = sp.toString();
  return adminFetch<{ orders: AdminOrder[]; total: number; limit: number; offset: number }>(
    `/orders${qs ? `?${qs}` : ''}`,
  );
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

export function deleteProduct(sku: string) {
  return adminFetch<{ success: boolean; sku: string }>(`/products/${encodeURIComponent(sku)}`, {
    method: 'DELETE',
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
  category: 'general' | 'complaint' | 'refund' | 'bug';
  categoryLabel: string;
  orderNo: string | null;
  status: 'new' | 'processing' | 'resolved';
  statusLabel: string;
  adminNote: string | null;
  adminReply: string | null;
  handledBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export function getContactMessages(status?: string, category?: string) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (category) params.set('category', category);
  const query = params.toString() ? `?${params.toString()}` : '';
  return adminFetch<{ messages: AdminContactMessage[] }>(`/contact-messages${query}`);
}

export function getNewContactMessagesCount(since?: string) {
  const query = since ? `?since=${encodeURIComponent(since)}` : '';
  return adminFetch<{ count: number; since: string }>(`/contact-messages/new-count${query}`);
}

export function getNotificationStatus() {
  return adminFetch<{
    channels: {
      telegram: { configured: boolean; chatCount: number };
      email: { configured: boolean; recipientCount: number };
    };
    orderNotifyEvents: string[];
  }>('/notifications/status');
}

export function sendNotificationTest() {
  return adminFetch<{ success: boolean; message: string }>('/notifications/test', { method: 'POST' });
}

export function updateContactMessage(
  id: number,
  body: { status?: string; adminNote?: string; adminReply?: string },
) {
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

export function batchCreateOrderShipments(
  items: Array<{ orderNo: string; carrier: string; trackingNo: string; note?: string }>,
) {
  return adminFetch<{ results: Array<{ orderNo: string; ok: boolean; error?: string }>; success: boolean }>(
    '/orders/shipments/batch',
    { method: 'POST', body: JSON.stringify({ items }) },
  );
}

export interface AdminShippingZone {
  id: number;
  code: string;
  labelI18n: Record<string, string>;
  countryCodes: string[];
  flatRateCents: number;
  perRecipient: boolean;
  weightFreeGrams?: number | null;
  weightBlockGrams?: number | null;
  weightBlockCents?: number | null;
  sortOrder: number;
  isDefault: boolean;
  active: boolean;
}

export function getShippingZones() {
  return adminFetch<{ zones: AdminShippingZone[] }>('/shipping/zones');
}

export function saveShippingZones(zones: Array<Omit<AdminShippingZone, 'id'>>) {
  return adminFetch<{ zones: AdminShippingZone[] }>('/shipping/zones', {
    method: 'PUT',
    body: JSON.stringify({ zones }),
  });
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

export type ShopHomeLayout = 'legacy' | 'crystal_v1';

export interface ShopConfigResponse {
  homeLayout: ShopHomeLayout;
  woldPerUsdt: number;
  layouts?: Array<{ id: ShopHomeLayout; label: string }>;
}

export function getShopConfig() {
  return adminFetch<ShopConfigResponse>('/shop-config');
}

export function saveShopConfig(input: { homeLayout?: ShopHomeLayout; woldPerUsdt?: number }) {
  return adminFetch<ShopConfigResponse>('/shop-config', {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export interface CrystalContentEntry {
  tagline: string;
  story: string;
  keywords: string[];
  benefits: string[];
  ritual: string;
  packNote: string;
}

export type CrystalContentMap = Record<string, CrystalContentEntry>;

export function getCrystalContent() {
  return adminFetch<{ content: CrystalContentMap }>('/crystal-content');
}

export function saveCrystalContent(content: CrystalContentMap) {
  return adminFetch<{ content: CrystalContentMap }>('/crystal-content', {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
}

/* ── 应用计费槽位（R6）────────────────────────────── */

export interface AdminBillingSlot {
  id: number;
  appSource: string;
  slotKey: string;
  sku: string;
  priceOverrideCents: number | null;
  priceOverrideUsdCents: number | null;
  sortOrder: number;
  active: boolean;
  updatedAt: string;
}

export function getBillingSlots() {
  return adminFetch<{ slots: AdminBillingSlot[] }>('/billing-slots');
}

export function saveBillingSlotEntries(app: string, key: string, entries: Array<{
  sku: string;
  priceOverrideCents?: number | null;
  priceOverrideUsdCents?: number | null;
  active?: boolean;
}>) {
  return adminFetch<{ app: string; key: string; rows: AdminBillingSlot[] }>('/billing-slots', {
    method: 'PUT',
    body: JSON.stringify({ app, key, entries }),
  });
}

export function deleteBillingSlot(app: string, key: string) {
  return adminFetch<{ success: boolean }>(
    `/billing-slots?app=${encodeURIComponent(app)}&key=${encodeURIComponent(key)}`,
    { method: 'DELETE' },
  );
}

/* ── 分类与标签（Q3 / R2）───────────────────────────── */

export interface AdminCategory {
  id: number;
  code: string;
  labelI18n: Record<string, string>;
  sortOrder: number;
  active: boolean;
}

export function getCategories() {
  return adminFetch<{ categories: AdminCategory[] }>('/categories');
}

export function saveCategory(body: {
  code: string;
  labelI18n: Record<string, string>;
  sortOrder?: number;
  active?: boolean;
}) {
  return adminFetch<{ category: AdminCategory }>('/categories', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export interface AdminTagGroup {
  id: number;
  code: string;
  labelI18n: Record<string, string>;
  sortOrder: number;
}

export interface AdminTag {
  id: number;
  groupId: number;
  code: string;
  labelI18n: Record<string, string>;
  sortOrder: number;
  active: boolean;
}

export function getTags() {
  return adminFetch<{ groups: AdminTagGroup[]; tags: AdminTag[] }>('/tags');
}

export function saveTagGroup(body: { code: string; labelI18n: Record<string, string>; sortOrder?: number }) {
  return adminFetch<{ group: AdminTagGroup }>('/tag-groups', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function saveTag(body: {
  groupId: number;
  code: string;
  labelI18n: Record<string, string>;
  sortOrder?: number;
  active?: boolean;
}) {
  return adminFetch<{ tag: AdminTag }>('/tags', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/* ── 商品关联页面（R5）──────────────────────────────── */

export interface AdminProductLink {
  id: number;
  sku: string;
  kind: 'internal' | 'media' | 'review' | 'article';
  title: string;
  titleI18n?: Record<string, string> | null;
  url: string;
  sourceName?: string | null;
  locale?: string | null;
  sortOrder: number;
  active: boolean;
}

export function getProductLinks(sku: string) {
  return adminFetch<{ links: AdminProductLink[] }>(`/products/${encodeURIComponent(sku)}/links`);
}

export function saveProductLinks(sku: string, links: Array<{
  kind: string;
  title: string;
  titleI18n?: Record<string, string> | null;
  url: string;
  sourceName?: string | null;
  locale?: string | null;
  active?: boolean;
}>) {
  return adminFetch<{ links: AdminProductLink[] }>(`/products/${encodeURIComponent(sku)}/links`, {
    method: 'PUT',
    body: JSON.stringify({ links }),
  });
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

/* ── UGC 评价（Phase D）──────────────────────────────── */

export interface AdminProductReview {
  id: number;
  userId: number;
  userLabel: string;
  sku: string;
  orderNo?: string | null;
  rating: number;
  body: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
}

export function getProductReviews(params?: { status?: string; sku?: string; limit?: number; offset?: number }) {
  const sp = new URLSearchParams();
  if (params?.status) sp.set('status', params.status);
  if (params?.sku) sp.set('sku', params.sku);
  if (params?.limit != null) sp.set('limit', String(params.limit));
  if (params?.offset != null) sp.set('offset', String(params.offset));
  const qs = sp.toString();
  return adminFetch<{ reviews: AdminProductReview[] }>(`/reviews${qs ? `?${qs}` : ''}`);
}

export function updateProductReviewStatus(id: number, status: string) {
  return adminFetch<{ success: boolean }>(`/reviews/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/* ── 促销券（Phase D）────────────────────────────────── */

export interface AdminCoupon {
  id: number;
  code: string;
  labelI18n: Record<string, string>;
  discountType: 'percent' | 'fixed_cents';
  discountValue: number;
  minOrderCents: number;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export function getCoupons() {
  return adminFetch<{ coupons: AdminCoupon[] }>('/coupons');
}

export function saveCoupons(coupons: Array<Omit<AdminCoupon, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>>) {
  return adminFetch<{ coupons: AdminCoupon[] }>('/coupons', {
    method: 'PUT',
    body: JSON.stringify({ coupons }),
  });
}

/* ── 数据统计（7b）──────────────────────────────────── */

export interface AdminAnalyticsSummary {
  days: number;
  since: string;
  total: number;
  byApp: Array<{ app: string; count: number }>;
  topEvents: Array<{ app: string; eventName: string; count: number }>;
  daily: Array<{ day: string; count: number }>;
}

export interface AdminDashboard {
  days: number;
  since: string;
  operations: {
    days: number;
    since: string;
    totals: { users: number; orders: number; readings: number };
    period: {
      newUsers: number;
      newOrders: number;
      paidOrders: number;
      revenueCents: number;
      newReadings: number;
    };
    ordersByStatus: Array<{ status: string; count: number }>;
    ordersByApp: Array<{ app: string; count: number }>;
    dailyOrders: Array<{ day: string; count: number }>;
  };
  analytics: AdminAnalyticsSummary;
}

export interface AdminAnalyticsEvent {
  id: number;
  app: string;
  eventName: string;
  userId: number | null;
  sessionKey: string;
  locale: string | null;
  path: string | null;
  referrerHost: string | null;
  properties: Record<string, string | number | boolean>;
  createdAt: string;
}

export function getDashboard(days = 7) {
  return adminFetch<AdminDashboard>(`/dashboard?days=${days}`);
}

export function getAnalyticsSummary(days = 7) {
  return adminFetch<AdminAnalyticsSummary>(`/analytics/summary?days=${days}`);
}

export function getAnalyticsEvents(params?: { app?: string; limit?: number; offset?: number }) {
  const sp = new URLSearchParams();
  if (params?.app) sp.set('app', params.app);
  if (params?.limit != null) sp.set('limit', String(params.limit));
  if (params?.offset != null) sp.set('offset', String(params.offset));
  const qs = sp.toString();
  return adminFetch<{ events: AdminAnalyticsEvent[] }>(`/analytics/events${qs ? `?${qs}` : ''}`);
}

/* ── Stripe 对账（7d-v1，仅 admin）────────────────────── */

export interface StripeSyncRun {
  id: number;
  status: string;
  chargesUpserted: number;
  refundsUpserted: number;
  payoutsUpserted: number;
  errorMessage: string | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface StripeBalanceSnapshot {
  id: number;
  syncRunId: number | null;
  currency: string;
  availableCents: number;
  pendingCents: number;
  capturedAt: string;
}

export interface StripeChargeRow {
  id: number;
  stripeId: string;
  paymentIntentId: string | null;
  orderNo: string | null;
  amountCents: number;
  amountRefundedCents: number;
  currency: string;
  status: string;
  paid: boolean;
  customerEmail: string | null;
  description: string | null;
  metadata: Record<string, string>;
  stripeCreatedAt: string;
  syncedAt: string;
}

export interface StripeRefundRow {
  id: number;
  stripeId: string;
  chargeStripeId: string;
  orderNo: string | null;
  amountCents: number;
  currency: string;
  status: string;
  reason: string | null;
  stripeCreatedAt: string;
  syncedAt: string;
}

export interface StripePayoutRow {
  id: number;
  stripeId: string;
  amountCents: number;
  currency: string;
  status: string;
  arrivalDate: string | null;
  stripeCreatedAt: string;
  syncedAt: string;
}

export interface StripeReconciliation {
  days: number;
  since: string;
  orders: { count: number; totalCents: number };
  charges: { count: number; grossCents: number; netCents: number };
  refunds: { count: number; totalCents: number };
  payouts: { count: number; totalCents: number };
  deltaCents: number;
  paymentMode: 'stripe' | 'mock';
  ordersMissingStripe: Array<{
    orderNo: string;
    amountCents: number;
    status: string;
    createdAt: string;
  }>;
  chargesMissingOrder: Array<{
    stripeId: string;
    orderNo: string | null;
    amountCents: number;
    amountRefundedCents: number;
    stripeCreatedAt: string;
  }>;
}

export function getStripeStatus() {
  return adminFetch<{
    configured: boolean;
    lastSync: StripeSyncRun | null;
    balances: StripeBalanceSnapshot[];
  }>('/stripe/status');
}

export function syncStripeMirror(days = 90) {
  return adminFetch<{ syncRun: StripeSyncRun }>('/stripe/sync', {
    method: 'POST',
    body: JSON.stringify({ days }),
  });
}

export function getStripeReconciliation(days = 30) {
  return adminFetch<StripeReconciliation>(`/stripe/reconciliation?days=${days}`);
}

export function getStripeCharges(limit = 50, offset = 0) {
  return adminFetch<{ charges: StripeChargeRow[] }>(`/stripe/charges?limit=${limit}&offset=${offset}`);
}

export function getStripeRefunds(limit = 50, offset = 0) {
  return adminFetch<{ refunds: StripeRefundRow[] }>(`/stripe/refunds?limit=${limit}&offset=${offset}`);
}

export function getStripePayouts(limit = 50, offset = 0) {
  return adminFetch<{ payouts: StripePayoutRow[] }>(`/stripe/payouts?limit=${limit}&offset=${offset}`);
}

/* ── 在线 IM（#8）──────────────────────────────────────── */

export interface AdminChatConversation {
  id: number;
  userId: number;
  status: string;
  userEmail: string;
  userLabel: string;
  unreadOps: number;
  lastBody: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface AdminChatMessage {
  id: number;
  conversationId: number;
  direction: 'user' | 'ops';
  body: string;
  readByUser: boolean;
  readByOps: boolean;
  createdAt: string;
}

export function getChatUnreadCount() {
  return adminFetch<{ count: number }>('/chat/unread-count');
}

export function getChatConversations(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return adminFetch<{ conversations: AdminChatConversation[] }>(`/chat/conversations${query}`);
}

export function getChatMessages(conversationId: number) {
  return adminFetch<{ messages: AdminChatMessage[] }>(`/chat/conversations/${conversationId}/messages`);
}

export function sendChatOpsMessage(conversationId: number, body: string) {
  return adminFetch<{ message: AdminChatMessage }>(`/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

export function closeChatConversation(conversationId: number) {
  return adminFetch<{ success: boolean }>(`/chat/conversations/${conversationId}/close`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/* ── 子账号（7a）────────────────────────────────────────── */

export interface AdminStaffAccount {
  id: number;
  email: string;
  nickname: string;
  role: 'admin' | 'shop_ops' | 'content_ops';
  roleLabel: string;
  staffLabel: string | null;
  staffDisabled: boolean;
  staffGrants: string[];
  staffRevokes: string[];
  permissions: string[];
  lastSignedIn: string;
  createdAt: string;
}

export function listStaffAccounts() {
  return adminFetch<{ staff: AdminStaffAccount[] }>('/staff');
}

export function getStaffMeta() {
  return adminFetch<{
    roles: Array<{ value: string; label: string }>;
    permissionLabels: Record<string, string>;
    assignableExtras: Array<{ value: string; label: string }>;
  }>('/staff/meta');
}

export function createStaffAccount(body: {
  email: string;
  password: string;
  nickname?: string;
  role: 'shop_ops' | 'content_ops';
  staffLabel?: string;
  staffGrants?: string[];
  staffRevokes?: string[];
}) {
  return adminFetch<{ staff: AdminStaffAccount }>('/staff', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateStaffAccount(
  id: number,
  body: {
    nickname?: string;
    role?: 'shop_ops' | 'content_ops';
    staffLabel?: string | null;
    staffDisabled?: boolean;
    staffGrants?: string[];
    staffRevokes?: string[];
    password?: string;
  },
) {
  return adminFetch<{ staff: AdminStaffAccount }>(`/staff/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/* ── 用户钱包（7c，仅 admin）────────────────────────────── */

export interface AdminWalletRow {
  id: number;
  userId: number;
  currency: string;
  balanceCents: number;
  balanceDisplay: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
    nickname: string;
    displayId: string | null;
  };
}

export interface AdminWalletLedgerEntry {
  id: number;
  walletId: number;
  userId: number;
  currency: string;
  kind: string;
  kindLabel: string;
  amountCents: number;
  amountDisplay: string;
  balanceAfterCents: number;
  balanceAfterDisplay: string;
  referenceType: string | null;
  referenceId: string | null;
  note: string | null;
  createdBy: number | null;
  createdAt: string;
}

export function listAdminWallets(q?: string, limit = 50, offset = 0) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  return adminFetch<{ wallets: AdminWalletRow[]; total: number; limit: number; offset: number }>(
    `/wallets?${params.toString()}`,
  );
}

export function getAdminWalletUser(userId: number) {
  return adminFetch<{
    user: { id: number; email: string; nickname: string; displayId: string | null };
    wallets: Array<Omit<AdminWalletRow, 'user'>>;
  }>(`/wallets/${userId}`);
}

export function getAdminWalletLedger(userId: number, limit = 50) {
  return adminFetch<{ entries: AdminWalletLedgerEntry[] }>(`/wallets/${userId}/ledger?limit=${limit}`);
}

export function adjustAdminWallet(
  userId: number,
  body: { currency: string; amountCents: number; note?: string },
) {
  return adminFetch<{ ledger: AdminWalletLedgerEntry; wallet: Omit<AdminWalletRow, 'user'> }>(
    `/wallets/${userId}/adjustment`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}
