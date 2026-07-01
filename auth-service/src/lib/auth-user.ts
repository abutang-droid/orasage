import type { Request } from "express";
import { extractToken, verifyToken } from "./jwt.ts";
import { db } from "../db/index.ts";
import { users } from "../db/schema.ts";
import { eq } from "drizzle-orm";

export async function getAuthUser(req: Request) {
  const token = extractToken(req.headers.authorization, req.headers.cookie);
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  const [user] = await db.select().from(users).where(eq(users.id, Number(payload.sub))).limit(1);
  return user ?? null;
}

export function publicUser(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    birthDate: user.birthDate,
    birthHour: user.birthHour,
    birthPlaceProvince: user.birthPlaceProvince,
    birthPlaceCity: user.birthPlaceCity,
    gender: user.gender,
    preferredDeity: user.preferredDeity,
    languagePreference: user.languagePreference,
    role: user.role,
    createdAt: user.createdAt,
    lastSignedIn: user.lastSignedIn,
  };
}
