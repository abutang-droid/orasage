import type { products } from "../db/schema.ts";
import {
  resolvePriceCents,
  type ShopCurrency,
} from "../../../shared/shop-locale/index.ts";

type ProductRow = typeof products.$inferSelect;

export function isSaleActive(
  row: Pick<ProductRow, "salePriceCents" | "saleStartsAt" | "saleEndsAt">,
  at: Date = new Date(),
): boolean {
  if (row.salePriceCents == null) return false;
  if (row.saleStartsAt && at < row.saleStartsAt) return false;
  if (row.saleEndsAt && at > row.saleEndsAt) return false;
  return true;
}

export function effectiveListPrice(row: ProductRow): { priceCents: number; priceCentsUsd: number | null } {
  if (isSaleActive(row)) {
    return {
      priceCents: row.salePriceCents!,
      priceCentsUsd: row.salePriceCentsUsd ?? row.priceCentsUsd,
    };
  }
  return { priceCents: row.priceCents, priceCentsUsd: row.priceCentsUsd };
}

export function resolvedEffectivePriceCents(row: ProductRow, currency: ShopCurrency): number {
  const { priceCents, priceCentsUsd } = effectiveListPrice(row);
  return resolvePriceCents({ priceCents, priceCentsUsd }, currency);
}
