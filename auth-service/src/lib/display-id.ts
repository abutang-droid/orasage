import { eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { users } from "../db/schema.ts";

/** 生成唯一 9 位展示编号 */
export async function generateUniqueDisplayId(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const id = String(Math.floor(100000000 + Math.random() * 900000000));
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.displayId, id)).limit(1);
    if (existing.length === 0) return id;
  }
  throw new Error("无法生成 displayId");
}

export function userDisplayName(user: { nickname: string; displayId: string | null }): string {
  const nick = user.nickname?.trim();
  if (nick) return nick;
  return user.displayId ?? "用户";
}
