import {
  pgTable,
  serial,
  varchar,
  timestamp,
  pgEnum,
  integer,
  text,
  boolean,
  real,
  jsonb,
  bigint,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin", "shop_ops", "content_ops"]);
export const appSourceEnum = pgEnum("app_source", ["bazi", "ziwei", "tarot", "shop"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "shipped",
  "completed",
  "cancelled",
]);

export const shipmentStatusEnum = pgEnum("shipment_status", [
  "pending",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
]);

export const contactMessageStatusEnum = pgEnum("contact_message_status", [
  "new",
  "processing",
  "resolved",
]);

export const contactMessageCategoryEnum = pgEnum("contact_message_category", [
  "general",
  "complaint",
  "refund",
  "bug",
]);

export const productReviewStatusEnum = pgEnum("product_review_status", [
  "pending",
  "approved",
  "rejected",
  "featured",
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
  couponCode: varchar("coupon_code", { length: 50 }),
  subtotalCents: integer("subtotal_cents"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAddresses = pgTable("user_addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  label: varchar("label", { length: 50 }),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  countryCode: varchar("country_code", { length: 2 }).notNull().default("CN"),
  province: varchar("province", { length: 100 }),
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),
  addressLine: varchar("address_line", { length: 500 }).notNull(),
  postalCode: varchar("postal_code", { length: 20 }),
  wristCm: varchar("wrist_cm", { length: 20 }),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderShipments = pgTable("order_shipments", {
  id: serial("id").primaryKey(),
  orderNo: varchar("order_no", { length: 64 }).notNull(),
  carrier: varchar("carrier", { length: 100 }).notNull(),
  trackingNo: varchar("tracking_no", { length: 100 }).notNull(),
  status: shipmentStatusEnum("status").notNull().default("in_transit"),
  shippedAt: timestamp("shipped_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderShipmentEvents = pgTable("order_shipment_events", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  location: varchar("location", { length: 200 }),
  occurredAt: timestamp("occurred_at").notNull(),
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
  nameI18n: jsonb("name_i18n").$type<Record<string, string>>(),
  element: varchar("element", { length: 10 }),
  material: varchar("material", { length: 200 }),
  materialI18n: jsonb("material_i18n").$type<Record<string, string>>(),
  color: varchar("color", { length: 100 }),
  colorI18n: jsonb("color_i18n").$type<Record<string, string>>(),
  weightGrams: integer("weight_grams"),
  beadDiameterMm: real("bead_diameter_mm"),
  wristCmMin: real("wrist_cm_min"),
  wristCmMax: real("wrist_cm_max"),
  lengthMm: real("length_mm"),
  packaging: text("packaging"),
  packagingI18n: jsonb("packaging_i18n").$type<Record<string, string>>(),
  attachments: jsonb("attachments").$type<Array<{ name: string; url: string }>>(),
  description: text("description").notNull(),
  descriptionI18n: jsonb("description_i18n").$type<Record<string, string>>(),
  priceCents: integer("price_cents").notNull(),
  priceCentsUsd: integer("price_cents_usd"),
  /** 前台展示分组；关联 product_categories.code（历史枚举值 crystal/report/service 起步） */
  category: varchar("category", { length: 50 }).notNull(),
  /** 业务形态：standard 实体 / digital 数字 / service 服务 / diy 定制 / combo 组合 */
  kind: varchar("kind", { length: 20 }).notNull().default("standard"),
  /** combo：true=按子商品价合计；false=使用 price_cents 作为组合优惠价 */
  comboUseComponentSum: boolean("combo_use_component_sum").notNull().default(true),
  /** public 前台可见 / unlisted 仅直链 / app_only 仅供应用计费调用 */
  visibility: varchar("visibility", { length: 20 }).notNull().default("public"),
  /** NULL=不限库存 */
  stock: integer("stock"),
  lowStockAt: integer("low_stock_at"),
  slug: varchar("slug", { length: 200 }),
  seoTitleI18n: jsonb("seo_title_i18n").$type<Record<string, string>>(),
  seoDescI18n: jsonb("seo_desc_i18n").$type<Record<string, string>>(),
  requiresShipping: boolean("requires_shipping").notNull().default(false),
  salePriceCents: integer("sale_price_cents"),
  salePriceCentsUsd: integer("sale_price_cents_usd"),
  saleStartsAt: timestamp("sale_starts_at"),
  saleEndsAt: timestamp("sale_ends_at"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** 组合商品子项（数字 + 实体等 SKU 组合） */
export const productComboItems = pgTable("product_combo_items", {
  id: serial("id").primaryKey(),
  comboSku: varchar("combo_sku", { length: 100 }).notNull(),
  componentSku: varchar("component_sku", { length: 100 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
});

/** 前台展示分类（Q3：可配置 + 多语言，替代原 product_category 枚举） */
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  labelI18n: jsonb("label_i18n").$type<Record<string, string>>().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** 标签分组（五行/功效/材质/场景…） */
export const productTagGroups = pgTable("product_tag_groups", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  labelI18n: jsonb("label_i18n").$type<Record<string, string>>().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productTags = pgTable("product_tags", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  labelI18n: jsonb("label_i18n").$type<Record<string, string>>().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productTagLinks = pgTable("product_tag_links", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  tagId: integer("tag_id").notNull(),
});

/** 商品关联页面（R5：站内文章 / 站外媒体报道 / 用户测评） */
export const productLinks = pgTable("product_links", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 100 }).notNull(),
  kind: varchar("kind", { length: 20 }).notNull().default("media"),
  title: varchar("title", { length: 300 }).notNull(),
  titleI18n: jsonb("title_i18n").$type<Record<string, string>>(),
  url: varchar("url", { length: 2000 }).notNull(),
  sourceName: varchar("source_name", { length: 200 }),
  locale: varchar("locale", { length: 10 }),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** 应用计费槽位（R6：app + slotKey → SKU；统一取代三张旧配置表） */
export const appBillingSlots = pgTable("app_billing_slots", {
  id: serial("id").primaryKey(),
  appSource: varchar("app_source", { length: 20 }).notNull(),
  slotKey: varchar("slot_key", { length: 100 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull(),
  priceOverrideCents: integer("price_override_cents"),
  priceOverrideUsdCents: integer("price_override_usd_cents"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const homepageFeaturedProducts = pgTable("homepage_featured_products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

/** 共振定制：珠子目录（水晶主珠 / 隔珠 / 隔片，逐颗计价） */
export const diyBeads = pgTable("diy_beads", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  element: varchar("element", { length: 10 }),
  material: varchar("material", { length: 100 }).notNull(),
  beadType: varchar("bead_type", { length: 20 }).notNull().default("crystal"),
  diameterMm: real("diameter_mm").notNull(),
  thicknessMm: real("thickness_mm"),
  priceCents: integer("price_cents").notNull(),
  priceCentsUsd: integer("price_cents_usd"),
  imageUrl: varchar("image_url", { length: 500 }),
  /** 渐变色占位（g0,g1,g2,line），上传实拍图后前台优先用 imageUrl */
  colors: varchar("colors", { length: 120 }),
  stock: integer("stock").notNull().default(999),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** 共振定制：用户设计稿（下单时固化为 ordered） */
export const diyDesigns = pgTable("diy_designs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  shareToken: varchar("share_token", { length: 32 }).unique(),
  name: varchar("name", { length: 100 }),
  beads: jsonb("beads").notNull().$type<string[]>(),
  wristCm: real("wrist_cm"),
  totalCents: integer("total_cents"),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  orderNo: varchar("order_no", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** 共振定制：全局配置（单行） */
export const diyConfig = pgTable("diy_config", {
  id: integer("id").primaryKey().default(1),
  /** 绳结/弹力余量修正（加在珠长总和上） */
  lengthCorrectionMm: real("length_correction_mm").notNull().default(3),
  minOrderCents: integer("min_order_cents").notNull().default(9900),
  fitToleranceMm: real("fit_tolerance_mm").notNull().default(8),
  wristEaseMm: real("wrist_ease_mm").notNull().default(10),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** 用户联系留言 / 工单（main 门户「联系我们」表单 → admin 运营后台处理） */
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  /** 提交时已登录则记录用户 id；游客留言为 null */
  userId: integer("user_id"),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 200 }),
  body: text("body").notNull(),
  locale: varchar("locale", { length: 10 }),
  category: contactMessageCategoryEnum("category").notNull().default("general"),
  orderNo: varchar("order_no", { length: 64 }),
  status: contactMessageStatusEnum("status").notNull().default("new"),
  /** 运营内部备注（用户不可见） */
  adminNote: text("admin_note"),
  /** 运营回复（用户可在「我的工单」查看，并邮件通知） */
  adminReply: text("admin_reply"),
  /** 处理人（admin 用户 id） */
  handledBy: integer("handled_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** UGC 商品评价（Phase D；CMS 精选评价为运营层，与此并存） */
export const productReviews = pgTable("product_reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sku: varchar("sku", { length: 100 }).notNull(),
  orderNo: varchar("order_no", { length: 64 }),
  rating: integer("rating").notNull(),
  body: text("body").notNull(),
  status: productReviewStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** 促销券 */
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  labelI18n: jsonb("label_i18n").$type<Record<string, string>>().notNull().default({}),
  discountType: varchar("discount_type", { length: 20 }).notNull().default("percent"),
  discountValue: integer("discount_value").notNull(),
  minOrderCents: integer("min_order_cents").notNull().default(0),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** 运费区域模板（Phase C） */
export const shippingZones = pgTable("shipping_zones", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  labelI18n: jsonb("label_i18n").$type<Record<string, string>>().notNull().default({}),
  countryCodes: jsonb("country_codes").$type<string[]>().notNull().default([]),
  flatRateCents: integer("flat_rate_cents").notNull().default(0),
  perRecipient: boolean("per_recipient").notNull().default(true),
  weightFreeGrams: integer("weight_free_grams"),
  weightBlockGrams: integer("weight_block_grams"),
  weightBlockCents: integer("weight_block_cents"),
  sortOrder: integer("sort_order").notNull().default(0),
  isDefault: boolean("is_default").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** 行为统计事件（#10） */
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  app: varchar("app", { length: 20 }).notNull(),
  eventName: varchar("event_name", { length: 100 }).notNull(),
  userId: integer("user_id"),
  sessionKey: varchar("session_key", { length: 64 }).notNull(),
  locale: varchar("locale", { length: 12 }),
  path: varchar("path", { length: 500 }),
  referrerHost: varchar("referrer_host", { length: 200 }),
  properties: jsonb("properties").$type<Record<string, string | number | boolean>>().notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Stripe 同步任务（7d-v1） */
export const stripeSyncRuns = pgTable("stripe_sync_runs", {
  id: serial("id").primaryKey(),
  status: varchar("status", { length: 20 }).notNull().default("running"),
  chargesUpserted: integer("charges_upserted").notNull().default(0),
  refundsUpserted: integer("refunds_upserted").notNull().default(0),
  payoutsUpserted: integer("payouts_upserted").notNull().default(0),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  finishedAt: timestamp("finished_at"),
});

export const stripeBalanceSnapshots = pgTable("stripe_balance_snapshots", {
  id: serial("id").primaryKey(),
  syncRunId: integer("sync_run_id"),
  currency: varchar("currency", { length: 8 }).notNull(),
  availableCents: integer("available_cents").notNull().default(0),
  pendingCents: integer("pending_cents").notNull().default(0),
  capturedAt: timestamp("captured_at").defaultNow().notNull(),
});

export const stripeCharges = pgTable("stripe_charges", {
  id: serial("id").primaryKey(),
  stripeId: varchar("stripe_id", { length: 120 }).notNull().unique(),
  paymentIntentId: varchar("payment_intent_id", { length: 120 }),
  orderNo: varchar("order_no", { length: 64 }),
  amountCents: integer("amount_cents").notNull(),
  amountRefundedCents: integer("amount_refunded_cents").notNull().default(0),
  currency: varchar("currency", { length: 8 }).notNull().default("cny"),
  status: varchar("status", { length: 30 }).notNull(),
  paid: boolean("paid").notNull().default(false),
  customerEmail: varchar("customer_email", { length: 320 }),
  description: text("description"),
  metadata: jsonb("metadata").$type<Record<string, string>>().notNull().default({}),
  stripeCreatedAt: timestamp("stripe_created_at").notNull(),
  syncedAt: timestamp("synced_at").defaultNow().notNull(),
});

export const stripeRefunds = pgTable("stripe_refunds", {
  id: serial("id").primaryKey(),
  stripeId: varchar("stripe_id", { length: 120 }).notNull().unique(),
  chargeStripeId: varchar("charge_stripe_id", { length: 120 }).notNull(),
  orderNo: varchar("order_no", { length: 64 }),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 8 }).notNull().default("cny"),
  status: varchar("status", { length: 30 }).notNull(),
  reason: varchar("reason", { length: 50 }),
  stripeCreatedAt: timestamp("stripe_created_at").notNull(),
  syncedAt: timestamp("synced_at").defaultNow().notNull(),
});

export const stripePayouts = pgTable("stripe_payouts", {
  id: serial("id").primaryKey(),
  stripeId: varchar("stripe_id", { length: 120 }).notNull().unique(),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 8 }).notNull().default("cny"),
  status: varchar("status", { length: 30 }).notNull(),
  arrivalDate: varchar("arrival_date", { length: 10 }),
  stripeCreatedAt: timestamp("stripe_created_at").notNull(),
  syncedAt: timestamp("synced_at").defaultNow().notNull(),
});

/** 在线 IM 会话（#8） */
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** 在线 IM 消息 */
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  direction: varchar("direction", { length: 10 }).notNull(),
  body: text("body").notNull(),
  telegramMessageId: bigint("telegram_message_id", { mode: "number" }),
  readByUser: boolean("read_by_user").notNull().default(false),
  readByOps: boolean("read_by_ops").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;

export {
  cityRecordSourceEnum,
  cityRecords,
  type CityRecordRow,
  type InsertCityRecordRow,
} from "./city-schema.ts";
