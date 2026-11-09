import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.ts";
import { salesChannels } from "../db/schema.ts";
import { normalizeChannelCode } from "../../../shared/sales-channels/index.ts";

export { normalizeChannelCode };

export async function resolveActiveChannelId(raw: string | null | undefined): Promise<number | null> {
  const code = normalizeChannelCode(raw);
  if (!code) return null;
  const [row] = await db
    .select({ id: salesChannels.id })
    .from(salesChannels)
    .where(and(eq(salesChannels.code, code), eq(salesChannels.status, "active")))
    .limit(1);
  return row?.id ?? null;
}

export async function loadChannelsByIds(ids: Array<number | null | undefined>) {
  const unique = [...new Set(ids.filter((id): id is number => Number.isInteger(id) && (id as number) > 0))];
  if (unique.length === 0) return new Map<number, { id: number; code: string; name: string }>();
  const rows = await db
    .select({ id: salesChannels.id, code: salesChannels.code, name: salesChannels.name })
    .from(salesChannels)
    .where(inArray(salesChannels.id, unique));
  return new Map(rows.map((row) => [row.id, row]));
}
