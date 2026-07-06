/** P5 祈福乐捐 — 跨 shop/tarot 共享常量与功德计算 */

export const TEMPLE_DONATION = {
  sku: 'temple-donation',
  /** 商品目录单价（分）；乐捐总额 = unitPriceCents × quantity */
  unitPriceCents: 1,
  unitPriceCentsUsd: 1,
  minCentsUsd: 1,
  maxCentsUsd: 100,
  meritMultiplierMin: 10,
  meritMultiplierMax: 100,
  explanationZh:
    '自愿供养，用于庙宇日常护持；功德计入您的修行记录。',
} as const;

/** 乐捐金额（分）→ 结账数量（单价 0.01） */
export function templeDonationQuantity(amountCents: number): number {
  return amountCents;
}

export function isValidTempleDonationQuantity(quantity: number): boolean {
  return (
    Number.isInteger(quantity)
    && quantity >= TEMPLE_DONATION.minCentsUsd
    && quantity <= TEMPLE_DONATION.maxCentsUsd
  );
}

export function randomIntInclusive(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomTempleDonationMultiplier(): number {
  return randomIntInclusive(TEMPLE_DONATION.meritMultiplierMin, TEMPLE_DONATION.meritMultiplierMax);
}

export function computeTempleDonationMerit(amountCentsUsd: number, multiplier: number): number {
  const amountUsd = amountCentsUsd / 100;
  return Math.max(1, Math.round(amountUsd * multiplier));
}

export function templeDonationMeritRange(amountCentsUsd: number): { min: number; max: number } {
  return {
    min: computeTempleDonationMerit(amountCentsUsd, TEMPLE_DONATION.meritMultiplierMin),
    max: computeTempleDonationMerit(amountCentsUsd, TEMPLE_DONATION.meritMultiplierMax),
  };
}

export type TarotOfferMeritKind =
  | 'paid_reading'
  | 'crystal_purchase'
  | 'crystal_gift'
  | 'temple_donation';

/** 将 shop SKU 映射为 tarot 供养功德类型（§C2） */
export function resolveTarotOfferKind(sku: string): TarotOfferMeritKind {
  const s = sku.toLowerCase();
  if (s === TEMPLE_DONATION.sku || s.includes('temple-donation')) return 'temple_donation';
  if (s.includes('gift')) return 'crystal_gift';
  if (s.includes('crystal')) return 'crystal_purchase';
  if (
    s.includes('report') ||
    s.includes('tarot') ||
    s.includes('reading') ||
    s.includes('draw') ||
    s.includes('consult')
  ) {
    return 'paid_reading';
  }
  return 'paid_reading';
}
