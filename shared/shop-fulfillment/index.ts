export type ProductFulfillment = {
  category: string;
  sku: string;
  requiresShipping?: boolean | null;
};

/** 实体商品是否需要收货地址（DB 字段优先，否则按分类/SKU 推断） */
export function inferRequiresShipping(product: ProductFulfillment): boolean {
  if (product.requiresShipping != null) return product.requiresShipping;
  if (product.category === 'crystal') return true;
  if (product.category === 'service') return false;
  if (/-advanced$|-premium$/.test(product.sku)) return true;
  return false;
}

/** 手串类商品需填写手腕周长 */
export function inferRequiresWristSize(product: ProductFulfillment): boolean {
  if (!inferRequiresShipping(product)) return false;
  return product.category === 'crystal' || product.sku.includes('-advanced');
}

/** 情侣装 SKU 支持 1/2 人地址切换 */
export function inferCoupleEligible(sku?: string | null): boolean {
  return Boolean(sku && sku.includes('couple'));
}

export const SHIPPING_COUNTRIES = [
  { code: 'CN', label: '中国' },
  { code: 'HK', label: '中国香港' },
  { code: 'MO', label: '中国澳门' },
  { code: 'TW', label: '中国台湾' },
  { code: 'US', label: '美国' },
  { code: 'CA', label: '加拿大' },
  { code: 'GB', label: '英国' },
  { code: 'AU', label: '澳大利亚' },
  { code: 'SG', label: '新加坡' },
  { code: 'MY', label: '马来西亚' },
  { code: 'JP', label: '日本' },
  { code: 'KR', label: '韩国' },
  { code: 'DE', label: '德国' },
  { code: 'FR', label: '法国' },
] as const;

export type ShippingRecipient = {
  name: string;
  phone: string;
  countryCode?: string;
  province?: string;
  city?: string;
  district?: string;
  address: string;
  postalCode?: string;
  wristCm?: string;
};

export type ShippingPayload = {
  recipients: ShippingRecipient[];
};

/** 全球配送运费估算（分）；国内免邮，境外按收件人数 flat rate + 可选重量附加费 */
export function estimateShippingFeeCents(
  countryCode: string,
  recipientCount = 1,
  weightGrams?: number | null,
): number {
  const code = (countryCode || 'CN').toUpperCase();
  const domestic = code === 'CN' || code === 'HK' || code === 'MO' || code === 'TW';
  const base = domestic ? 0 : 1500;
  let fee = base * Math.max(1, recipientCount);
  if (!domestic && weightGrams && weightGrams > 500) {
    const blocks = Math.ceil((weightGrams - 500) / 500);
    fee += blocks * 500;
  }
  return fee;
}

export function formatRecipientLine(r: ShippingRecipient): string {
  const country = r.countryCode && r.countryCode !== 'CN'
    ? SHIPPING_COUNTRIES.find((c) => c.code === r.countryCode)?.label ?? r.countryCode
    : '';
  const parts = [country, r.province, r.city, r.district, r.address, r.postalCode ? `邮编 ${r.postalCode}` : '']
    .filter(Boolean);
  return parts.join(' ');
}

export function formatShippingAddress(payload: ShippingPayload): string {
  return JSON.stringify(payload);
}

export function parseShippingAddress(raw: string | null | undefined): ShippingPayload | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as ShippingPayload;
    if (Array.isArray(parsed.recipients) && parsed.recipients.length > 0) {
      return parsed;
    }
  } catch {
    // legacy plain-text address
    return {
      recipients: [{ name: '', phone: '', address: raw.trim() }],
    };
  }
  return null;
}

export function formatShippingDisplay(raw: string | null | undefined): string {
  const payload = parseShippingAddress(raw);
  if (!payload) return '';
  return payload.recipients
    .map((r, i) => {
      const parts = [
        r.name,
        r.phone,
        formatRecipientLine(r),
        r.wristCm ? `手腕 ${r.wristCm}cm` : '',
      ].filter(Boolean);
      const label = payload.recipients.length > 1 ? `第${i + 1}位: ` : '';
      return label + parts.join(' · ');
    })
    .join(' | ');
}

export function validateShippingPayload(
  payload: ShippingPayload,
  options: { requireWrist?: boolean; recipientCount?: number },
): string | null {
  const count = options.recipientCount ?? 1;
  if (payload.recipients.length < count) {
    return `请填写 ${count} 位收货人信息`;
  }
  for (let i = 0; i < count; i += 1) {
    const r = payload.recipients[i];
    const prefix = count > 1 ? `第${i + 1}位` : '';
    if (!r.name?.trim()) return prefix ? `${prefix}请填写收货人姓名` : '请填写收货人姓名';
    if (!r.phone?.trim()) return prefix ? `${prefix}请填写联系电话` : '请填写联系电话';
    if (!r.countryCode?.trim()) return prefix ? `${prefix}请选择国家/地区` : '请选择国家/地区';
    if (!r.address?.trim()) return prefix ? `${prefix}请填写详细地址` : '请填写详细地址';
    if (options.requireWrist && !r.wristCm?.trim()) {
      return prefix ? `${prefix}请填写手腕周长` : '请填写手腕周长';
    }
  }
  return null;
}

export type ShipmentEvent = {
  status: string;
  description: string;
  location?: string | null;
  occurredAt: string;
};

export type OrderShipment = {
  id: number;
  carrier: string;
  trackingNo: string;
  status: string;
  shippedAt?: string | null;
  events: ShipmentEvent[];
};

export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  pending: '待揽收',
  picked_up: '已揽收',
  in_transit: '运输中',
  out_for_delivery: '派送中',
  delivered: '已签收',
};
