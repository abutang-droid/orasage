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
export const appSourceEnum = pgEnum("app_source", ["bazi", "ziwei", "tarot", "shop"]);
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
  displayId: varchar("display_id", { length: 9 }).unique(),
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
  shippingAddress: text("shipping_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const savedProfiles = pgTable("saved_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  label: varchar("label", { length: 50 }),
  name: varchar("name", { length: 100 }).notNull(),
  gender: varchar("gender", { length: 10 }),
  birthYear: varchar("birth_year", { length: 4 }),
  birthMonth: varchar("birth_month", { length: 2 }),
  birthDay: varchar("birth_day", { length: 2 }),
  birthHour: varchar("birth_hour", { length: 2 }),
  birthMinute: varchar("birth_minute", { length: 2 }),
  birthPlaceProvince: varchar("birth_place_province", { length: 50 }),
  birthPlaceCity: varchar("birth_place_city", { length: 50 }),
  birthPlaceLongitude: varchar("birthplace_longitude", { length: 20 }),
  sourceApp: appSourceEnum("source_app"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
