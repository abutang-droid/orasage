import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const baziUserRoleEnum = pgEnum("bazi_user_role", ["user", "admin"]);
export const baziRecordTypeEnum = pgEnum("bazi_record_type", ["single", "couple"]);
export const baziPlanTypeEnum = pgEnum("bazi_plan_type", ["basic", "advanced", "premium"]);
export const baziPurchaseStatusEnum = pgEnum("bazi_purchase_status", [
  "pending",
  "completed",
  "failed",
]);
export const baziPushStatusEnum = pgEnum("bazi_push_status", ["pending", "pushed", "failed"]);
export const baziReportTypeEnum = pgEnum("bazi_report_type", ["single", "couple"]);

/**
 * Core user table backing auth flow.
 * Columns use camelCase to match the legacy MySQL schema and generated types.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: baziUserRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const baziRecords = pgTable("bazi_records", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: baziRecordTypeEnum("type").notNull(),
  name1: varchar("name1", { length: 64 }).notNull(),
  name2: varchar("name2", { length: 64 }),
  inputData: jsonb("inputData").notNull(),
  resultSummary: jsonb("resultSummary"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type BaziRecord = typeof baziRecords.$inferSelect;
export type InsertBaziRecord = typeof baziRecords.$inferInsert;

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  baziRecordId: integer("baziRecordId"),
  planType: baziPlanTypeEnum("planType").notNull(),
  price: varchar("price", { length: 32 }).notNull(),
  stripePaymentId: varchar("stripePaymentId", { length: 255 }),
  status: baziPurchaseStatusEnum("status").default("pending").notNull(),
  name: varchar("name", { length: 64 }),
  inputSummary: jsonb("inputSummary"),
  reportUrl: text("reportUrl"),
  pushStatus: baziPushStatusEnum("pushStatus").default("pending").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type InsertPurchase = typeof purchases.$inferInsert;

export const baziReports = pgTable("bazi_reports", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  purchaseId: integer("purchaseId"),
  type: baziReportTypeEnum("type").notNull(),
  baziData: jsonb("baziData").notNull(),
  reportContent: text("reportContent"),
  pdfUrl: varchar("pdfUrl", { length: 512 }),
  recommendedBracelet: varchar("recommendedBracelet", { length: 10 }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type BaziReport = typeof baziReports.$inferSelect;
export type InsertBaziReport = typeof baziReports.$inferInsert;
