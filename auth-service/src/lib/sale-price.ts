import type { products } from "../db/schema.ts";
import {
  resolvePriceCents,
  type ShopCurrency,
} from "../../../shared/shop-locale/index.ts";

type ProductRow = typeof products.$inferSelect;

export function isSaleActive(
  row: Pick<ProductRow, "salePriceCents" | "salePriceCentsUsd" | "saleStartsAt" | "saleEndsAt">,
  at: Date = new Date(),
): boolean {
  const hasSale =
    (row.salePriceCentsUsd != null && row.salePriceCentsUsd > 0) ||
    (row.salePriceCents != null && row.salePriceCents > 0);
  if (!hasSale) return false;
  if (row.saleStartsAt && at < row.saleStartsAt) return false;
  if (row.saleEndsAt && at > row.saleEndsAt) return false;
  return true;
}

export function effectiveListPrice(row: ProductRow): { priceCents: number; priceCentsUsd: number | null } {
  // USD-only: prefer USD columns; mirror into priceCents for legacy readers.
  if (isSaleActive(row)) {
    const usd = row.salePriceCentsUsd ?? row.salePriceCents ?? row.priceCentsUsd ?? row.priceCents;
    return { priceCents: usd, priceCentsUsd: usd };
  }
  const usd = row.priceCentsUsd ?? row.priceCents;
  return { priceCents: usd, priceCentsUsd: usd };
}

export function resolvedEffectivePriceCents(row: ProductRow, currency: ShopCurrency): number {
  const { priceCents, priceCentsUsd } = effectiveListPrice(row);
  return resolvePriceCents({ priceCents, priceCentsUsd }, currency);
}
