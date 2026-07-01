import {
  pgTable,
  serial,
  varchar,
  timestamp,
  pgEnum,
  integer,
  text,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const appSourceEnum = pgEnum("app_source", ["bazi", "ziwei", "tarot"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "shipped",
  "completed",
  "cancelled",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  nickname: varchar("nickname", { length: 100 }).notNull().default(""),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  birthDate: varchar("birth_date", { length: 20 }),
  birthHour: varchar("birth_hour", { length: 10 }),
  birthPlaceProvince: varchar("birth_place_province", { length: 50 }),
  birthPlaceCity: varchar("birth_place_city", { length: 50 }),
  birthPlaceLongitude: varchar("birthplace_longitude", { length: 20 }),
  gender: varchar("gender", { length: 10 }),
  preferredDeity: varchar("preferred_deity", { length: 50 }),
  languagePreference: varchar("language_preference", { length: 10 }).default("zh-CN"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export const userReadings = pgTable("user_readings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  appSource: appSourceEnum("app_source").notNull(),
  readingId: varchar("reading_id", { length: 100 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  summary: text("summary"),
  recommendationReason: text("recommendation_reason"),
  crystalSku: varchar("crystal_sku", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userOrders = pgTable("user_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  orderNo: varchar("order_no", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  amountCents: integer("amount_cents").notNull().default(0),
  currency: varchar("currency", { length: 8 }).notNull().default("CNY"),
  status: orderStatusEnum("status").notNull().default("pending"),
  appSource: appSourceEnum("app_source"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRecommendations = pgTable("user_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  appSource: appSourceEnum("app_source").notNull(),
  crystalSku: varchar("crystal_sku", { length: 100 }).notNull(),
  reason: text("reason").notNull(),
  readingId: varchar("reading_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
