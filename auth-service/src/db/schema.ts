import {
  pgTable,
  serial,
  varchar,
  timestamp,
  pgEnum,
  integer,
  text,
  boolean,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const appSourceEnum = pgEnum("app_source", ["bazi", "ziwei", "tarot", "shop"]);
export const productCategoryEnum = pgEnum("product_category", ["crystal", "report", "service"]);
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
  reportUrl: varchar("report_url", { length: 512 }),
  payloadJson: text("payload_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userOrders = pgTable("user_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  orderNo: varchar("order_no", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  sku: varchar("sku", { length: 100 }),
  amountCents: integer("amount_cents").notNull().default(0),
  currency: varchar("currency", { length: 8 }).notNull().default("CNY"),
  status: orderStatusEnum("status").notNull().default("pending"),
  appSource: appSourceEnum("app_source"),
  shippingAddress: text("shipping_address"),
  recommendationContext: text("recommendation_context"),
  readingId: varchar("reading_id", { length: 100 }),
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

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  element: varchar("element", { length: 10 }),
  description: text("description").notNull(),
  priceCents: integer("price_cents").notNull(),
  priceCentsUsd: integer("price_cents_usd"),
  category: productCategoryEnum("category").notNull(),
  requiresShipping: boolean("requires_shipping").notNull().default(false),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const homepageFeaturedProducts = pgTable("homepage_featured_products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** 八字基础版报告内五行 → 推荐商品 SKU */
export const baziElementRecommendations = pgTable("bazi_element_recommendations", {
  element: varchar("element", { length: 10 }).primaryKey(),
  sku: varchar("sku", { length: 100 }).notNull(),
  /** 报告推荐价（分）；为空则使用商城目录价 */
  priceCents: integer("price_cents"),
  priceCentsUsd: integer("price_cents_usd"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** 紫微对话页底部商品推荐（多 SKU 轮换，前台单卡片展示） */
export const ziweiProductRecommendations = pgTable("ziwei_product_recommendations", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 100 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** 塔罗计费 SKU 配置（单行） */
export const tarotBillingConfig = pgTable("tarot_billing_config", {
  id: integer("id").primaryKey().default(1),
  dailyOverageSku: varchar("daily_overage_sku", { length: 100 }).notNull().default("tarot-daily-draw"),
  threeCardReportSku: varchar("three_card_report_sku", { length: 100 }).notNull().default("report-tarot"),
  threeCardBundleSku: varchar("three_card_bundle_sku", { length: 100 }).notNull().default("report-tarot-bundle"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** 塔罗每日运势报告后推荐商品（多 SKU 轮换） */
export const tarotDailyRecommendProducts = pgTable("tarot_daily_recommend_products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 100 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** 账户级紫微问答额度（加量包余额 + 年卡到期） */
export const ziweiChatAccounts = pgTable("ziwei_chat_accounts", {
  userId: integer("user_id").primaryKey(),
  packCredits: integer("pack_credits").notNull().default(0),
  yearlyExpiresAt: timestamp("yearly_expires_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** 每份排盘 readingId 的免费问答消耗 */
export const ziweiReadingChat = pgTable("ziwei_reading_chat", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  readingId: varchar("reading_id", { length: 100 }).notNull(),
  freeQuestionsUsed: integer("free_questions_used").notNull().default(0),
  totalQuestionsUsed: integer("total_questions_used").notNull().default(0),
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

export {
  cityRecordSourceEnum,
  cityRecords,
  type CityRecordRow,
  type InsertCityRecordRow,
} from "./city-schema.ts";
