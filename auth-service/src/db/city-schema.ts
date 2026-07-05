import {
  pgTable,
  serial,
  varchar,
  timestamp,
  pgEnum,
  doublePrecision,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const cityRecordSourceEnum = pgEnum("city_record_source", ["seed", "ai_confirmed"]);

export const cityRecords = pgTable(
  "city_records",
  {
    id: serial("id").primaryKey(),
    city: varchar("city", { length: 64 }).notNull(),
    province: varchar("province", { length: 64 }).notNull().default(""),
    country: varchar("country", { length: 64 }).notNull().default("中国"),
    lng: doublePrecision("lng").notNull(),
    lat: doublePrecision("lat").notNull(),
    timezone: varchar("timezone", { length: 8 }).notNull().default("+8"),
    alias: jsonb("alias").$type<string[]>().default([]),
    pinyin: varchar("pinyin", { length: 16 }),
    searchKeys: jsonb("search_keys").$type<string[]>().default([]),
    source: cityRecordSourceEnum("source").notNull().default("ai_confirmed"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("city_records_place_uidx").on(table.city, table.province, table.country),
  ],
);

export type CityRecordRow = typeof cityRecords.$inferSelect;
export type InsertCityRecordRow = typeof cityRecords.$inferInsert;
