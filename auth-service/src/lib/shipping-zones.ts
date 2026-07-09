import { asc, eq } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { shippingZones } from '../db/schema.ts';
import { estimateShippingFeeCents as estimateHardcoded } from '../../../shared/shop-fulfillment/index.ts';

export type ShippingZoneRow = typeof shippingZones.$inferSelect;

export type ShippingZoneInput = {
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
};

export async function listShippingZones(activeOnly = false): Promise<ShippingZoneRow[]> {
  const rows = await db
    .select()
    .from(shippingZones)
    .orderBy(asc(shippingZones.sortOrder), asc(shippingZones.id));
  return activeOnly ? rows.filter((z) => z.active) : rows;
}

export function computeFeeFromZone(
  zone: ShippingZoneRow,
  recipientCount = 1,
  weightGrams?: number | null,
): number {
  let fee = zone.flatRateCents * (zone.perRecipient ? Math.max(1, recipientCount) : 1);
  if (
    weightGrams &&
    zone.weightFreeGrams != null &&
    zone.weightBlockGrams != null &&
    zone.weightBlockCents != null &&
    weightGrams > zone.weightFreeGrams
  ) {
    const blocks = Math.ceil((weightGrams - zone.weightFreeGrams) / zone.weightBlockGrams);
    fee += blocks * zone.weightBlockCents;
  }
  return fee;
}

export function resolveZoneForCountry(
  zones: ShippingZoneRow[],
  countryCode: string,
): ShippingZoneRow | null {
  const code = (countryCode || 'CN').toUpperCase();
  const match = zones.find(
    (z) => z.active && Array.isArray(z.countryCodes) && z.countryCodes.includes(code),
  );
  if (match) return match;
  return zones.find((z) => z.active && z.isDefault) ?? null;
}

export async function estimateShippingFeeFromDb(
  countryCode: string,
  recipientCount = 1,
  weightGrams?: number | null,
): Promise<number> {
  const zones = await listShippingZones(true);
  if (zones.length === 0) {
    return estimateHardcoded(countryCode, recipientCount, weightGrams);
  }
  const zone = resolveZoneForCountry(zones, countryCode);
  if (!zone) return estimateHardcoded(countryCode, recipientCount, weightGrams);
  return computeFeeFromZone(zone, recipientCount, weightGrams);
}

export async function replaceShippingZones(inputs: ShippingZoneInput[]): Promise<ShippingZoneRow[]> {
  await db.delete(shippingZones);
  if (inputs.length === 0) return [];
  const inserted = await db
    .insert(shippingZones)
    .values(
      inputs.map((z) => ({
        code: z.code,
        labelI18n: z.labelI18n,
        countryCodes: z.countryCodes,
        flatRateCents: z.flatRateCents,
        perRecipient: z.perRecipient,
        weightFreeGrams: z.weightFreeGrams ?? null,
        weightBlockGrams: z.weightBlockGrams ?? null,
        weightBlockCents: z.weightBlockCents ?? null,
        sortOrder: z.sortOrder,
        isDefault: z.isDefault,
        active: z.active,
      })),
    )
    .returning();
  return inserted;
}

export function formatShippingZone(z: ShippingZoneRow) {
  return {
    id: z.id,
    code: z.code,
    labelI18n: z.labelI18n ?? {},
    countryCodes: z.countryCodes ?? [],
    flatRateCents: z.flatRateCents,
    perRecipient: z.perRecipient,
    weightFreeGrams: z.weightFreeGrams,
    weightBlockGrams: z.weightBlockGrams,
    weightBlockCents: z.weightBlockCents,
    sortOrder: z.sortOrder,
    isDefault: z.isDefault,
    active: z.active,
  };
}
