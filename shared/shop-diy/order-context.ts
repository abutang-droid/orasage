/** 共振定制（DIY 手串）订单上下文：设计快照存入 user_orders.recommendation_context */

export const DIY_ORDER_SKU = 'diy-bracelet';

export type DiyOrderItem = {
  code: string;
  name: string;
  sizeLabel: string;
  type: string;
  quantity: number;
  priceCents: number;
};

export type DiyOrderContext = {
  type: 'diy_bracelet';
  designId?: number;
  wristCm: number;
  lengthMm: number;
  /** 珠序（穿制顺序，code 数组） */
  sequence: string[];
  items: DiyOrderItem[];
};

export function encodeDiyOrderContext(ctx: Omit<DiyOrderContext, 'type'>): string {
  const payload: DiyOrderContext = { type: 'diy_bracelet', ...ctx };
  return JSON.stringify(payload);
}

export function parseDiyOrderContext(raw: string | null | undefined): DiyOrderContext | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<DiyOrderContext>;
    if (parsed.type !== 'diy_bracelet') return null;
    if (!Array.isArray(parsed.sequence) || !Array.isArray(parsed.items)) return null;
    if (typeof parsed.wristCm !== 'number' || typeof parsed.lengthMm !== 'number') return null;
    return parsed as DiyOrderContext;
  } catch {
    return null;
  }
}

export function isDiyOrder(order: { sku?: string | null; recommendationContext?: string | null }): boolean {
  if (order.sku === DIY_ORDER_SKU) return true;
  return parseDiyOrderContext(order.recommendationContext) !== null;
}

/** 穿制顺序展示：「1.净体白水晶 8mm → 2.藏银隔片 6×1.5mm → …」 */
export function formatDiySequence(ctx: DiyOrderContext): string[] {
  const byCode = new Map(ctx.items.map((item) => [item.code, item]));
  return ctx.sequence.map((code, i) => {
    const item = byCode.get(code);
    return `${i + 1}. ${item ? `${item.name} ${item.sizeLabel}` : code}`;
  });
}
