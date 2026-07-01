/**
 * Drizzle 关系定义
 *
 * 当前所有关系由应用层维护（user_id 检查在业务代码中完成）。
 * 以下是 Drizzle 关系 API 的定义框架，用于类型推导和未来添加约束时参考。
 */
import { relations } from "drizzle-orm";
import { users, baziRecords, purchases, baziReports } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  baziRecords: many(baziRecords),
  purchases: many(purchases),
  baziReports: many(baziReports),
}));

export const baziRecordsRelations = relations(baziRecords, ({ one }) => ({
  user: one(users, {
    fields: [baziRecords.userId],
    references: [users.id],
  }),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
  baziRecord: one(baziRecords, {
    fields: [purchases.baziRecordId],
    references: [baziRecords.id],
  }),
}));

export const baziReportsRelations = relations(baziReports, ({ one }) => ({
  user: one(users, {
    fields: [baziReports.userId],
    references: [users.id],
  }),
  purchase: one(purchases, {
    fields: [baziReports.purchaseId],
    references: [purchases.id],
  }),
}));
