import { asc, and, eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { cityRecords, type CityRecordRow } from "../db/city-schema.ts";

export type CityDto = {
  city: string;
  province: string;
  country: string;
  lng: number;
  lat: number;
  timezone: string;
  alias?: string[];
  pinyin?: string;
};

export function rowToDto(row: CityRecordRow): CityDto {
  return {
    city: row.city,
    province: row.province,
    country: row.country,
    lng: row.lng,
    lat: row.lat,
    timezone: row.timezone,
    alias: (row.alias as string[] | null) ?? undefined,
    pinyin: row.pinyin ?? undefined,
  };
}

export async function listConfirmedCities(): Promise<CityDto[]> {
  const rows = await db
    .select()
    .from(cityRecords)
    .where(eq(cityRecords.source, "ai_confirmed"))
    .orderBy(asc(cityRecords.id));
  return rows.map(rowToDto);
}

export async function upsertConfirmedCity(input: {
  city: string;
  province: string;
  country: string;
  lng: number;
  lat: number;
  timezone: string;
  alias?: string[];
  pinyin?: string;
  searchKey?: string;
}): Promise<CityDto> {
  const existing = await db
    .select()
    .from(cityRecords)
    .where(
      and(
        eq(cityRecords.city, input.city),
        eq(cityRecords.province, input.province),
        eq(cityRecords.country, input.country),
      ),
    )
    .limit(1);

  const mergedKeys = new Set<string>(existing[0]?.searchKeys as string[] | undefined);
  if (input.searchKey) mergedKeys.add(input.searchKey);

  const [row] = await db
    .insert(cityRecords)
    .values({
      city: input.city,
      province: input.province,
      country: input.country,
      lng: input.lng,
      lat: input.lat,
      timezone: input.timezone,
      alias: input.alias ?? [],
      pinyin: input.pinyin ?? null,
      searchKeys: [...mergedKeys],
      source: "ai_confirmed",
    })
    .onConflictDoUpdate({
      target: [cityRecords.city, cityRecords.province, cityRecords.country],
      set: {
        lng: input.lng,
        lat: input.lat,
        timezone: input.timezone,
        alias: input.alias ?? [],
        pinyin: input.pinyin ?? null,
        searchKeys: [...mergedKeys],
      },
    })
    .returning();

  return rowToDto(row);
}
