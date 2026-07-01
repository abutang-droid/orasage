import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 八字排盘历史记录表
 * 存储用户的排盘输入和结果摘要
 */
export const baziRecords = mysqlTable("bazi_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** single = 单人排盘, couple = 双人合盘 */
  type: mysqlEnum("type", ["single", "couple"]).notNull(),
  /** 第一人姓名 */
  name1: varchar("name1", { length: 64 }).notNull(),
  /** 第二人姓名（合盘时使用） */
  name2: varchar("name2", { length: 64 }),
  /** 排盘输入参数（JSON） */
  inputData: json("inputData").notNull(),
  /** 排盘结果摘要（JSON，存储命主日柱、五行分布等关键字段） */
  resultSummary: json("resultSummary"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BaziRecord = typeof baziRecords.$inferSelect;
export type InsertBaziRecord = typeof baziRecords.$inferInsert;

/**
 * 用户购买记录表
 * 记录用户购买的方案和支付状态
 */
export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** 排盘结果ID（可选，关联 bazi_records） */
  baziRecordId: int("baziRecordId"),
  /** 方案类型 */
  planType: mysqlEnum("planType", ["basic", "advanced", "premium"]).notNull(),
  /** 支付金额（人民币，元） */
  price: varchar("price", { length: 32 }).notNull(),
  /** Stripe PaymentIntent ID（待支付对接后使用） */
  stripePaymentId: varchar("stripePaymentId", { length: 255 }),
  /** 支付状态 */
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  /** 购买时命主姓名（方便展示） */
  name: varchar("name", { length: 64 }),
  /** 排盘输入的 JSON 摘要 */
  inputSummary: json("inputSummary"),
  /** 报告 HTML 的公开 URL（生成后立即可用） */
  reportUrl: text("reportUrl"),
  /** 报告推送到 WordPress 的状态 */
  pushStatus: mysqlEnum("pushStatus", ["pending", "pushed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InsertPurchase = typeof purchases.$inferInsert;

/**
 * 用户报告表
 * 存储已购买的 AI 解读报告内容
 */
export const baziReports = mysqlTable("bazi_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  purchaseId: int("purchaseId"),
  /** 排盘类型 */
  type: mysqlEnum("type", ["single", "couple"]).notNull(),
  /** 排盘数据摘要（JSON，包含命主信息、四柱等） */
  baziData: json("baziData").notNull(),
  /** AI 解读报告内容（Markdown） */
  reportContent: text("reportContent"),
  /** PDF 下载链接 */
  pdfUrl: varchar("pdfUrl", { length: 512 }),
  /** 推荐手串五行 */
  recommendedBracelet: varchar("recommendedBracelet", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BaziReport = typeof baziReports.$inferSelect;
export type InsertBaziReport = typeof baziReports.$inferInsert;

