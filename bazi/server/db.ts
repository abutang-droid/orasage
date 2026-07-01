import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, baziRecords, InsertBaziRecord, purchases, baziReports, InsertPurchase, InsertBaziReport } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── 八字排盘记录 ─────────────────────────────────────────────────────────────

export async function saveBaziRecord(record: InsertBaziRecord) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save bazi record: database not available");
    return null;
  }
  const result = await db.insert(baziRecords).values(record);
  return result;
}

export async function getUserBaziRecords(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get bazi records: database not available");
    return [];
  }
  return db
    .select()
    .from(baziRecords)
    .where(eq(baziRecords.userId, userId))
    .orderBy(desc(baziRecords.createdAt))
    .limit(limit);
}

export async function deleteBaziRecord(recordId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(baziRecords)
    .where(and(eq(baziRecords.id, recordId), eq(baziRecords.userId, userId)));
}


// ─── 购买记录 ─────────────────────────────────────────────────────────────────

export async function createPurchase(record: InsertPurchase) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create purchase: database not available");
    return null;
  }
  const result = await db.insert(purchases).values(record);
  return result;
}

/** 更新购买记录的 reportUrl 和 pushStatus */
export async function updatePurchaseReport(purchaseId: number, reportUrl: string, pushStatus: 'pushed' | 'failed') {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .update(purchases)
    .set({ reportUrl, pushStatus })
    .where(eq(purchases.id, purchaseId));
  return result;
}

/** 获取所有 pushStatus 为 pending 的购买记录（用于补推） */
export async function getPendingPushPurchases() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(purchases)
    .where(eq(purchases.pushStatus, 'pending'))
    .orderBy(desc(purchases.createdAt))
    .limit(50);
}

/** 获取指定 email 的所有 pending 购买记录（用于关联补推） */
export async function getPendingPurchasesByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];
  // purchase 表没有 email 列，通过 name 字段间接关联不够可靠
  // 实际补推逻辑在 buyPlan 中：每次成功推送时顺带尝试补推同 email 的 pending 记录
  return [];
}

export async function getUserPurchases(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(purchases)
    .where(eq(purchases.userId, userId))
    .orderBy(desc(purchases.createdAt));
}

// ─── 用户报告 ─────────────────────────────────────────────────────────────────

export async function createBaziReport(record: InsertBaziReport) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create report: database not available");
    return null;
  }
  const result = await db.insert(baziReports).values(record);
  return result;
}

export async function getUserBaziReports(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(baziReports)
    .where(eq(baziReports.userId, userId))
    .orderBy(desc(baziReports.createdAt));
}
