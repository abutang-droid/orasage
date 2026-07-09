import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { db } from "../db/index.ts";
import { users } from "../db/schema.ts";
import { eq } from "drizzle-orm";
import { extractToken, signToken, verifyToken, getCookieOptions } from "../lib/jwt.ts";
import { getAuthUser, publicUser } from "../lib/auth-user.ts";
import { generateUniqueDisplayId } from "../lib/display-id.ts";
import { accountRouter } from "./account.ts";
import { liveChatRouter } from "./live-chat.ts";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(6).max(128),
  nickname: z.string().max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const checkoutEmailSchema = z.object({
  email: z.string().email().max(320),
});

const profileSchema = z.object({
  nickname: z.string().max(100).optional(),
  avatarUrl: z.string().url().max(500).optional().nullable(),
  birthDate: z.string().max(20).optional().nullable(),
  birthHour: z.string().max(10).optional().nullable(),
  birthPlaceProvince: z.string().max(50).optional().nullable(),
  birthPlaceCity: z.string().max(50).optional().nullable(),
  gender: z.enum(["male", "female"]).optional().nullable(),
  preferredDeity: z.string().max(50).optional().nullable(),
  languagePreference: z.string().max(10).optional().nullable(),
});

// ── POST /auth/register ──
authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body);

    // 检查邮箱是否已注册
    const existing = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "该邮箱已注册" });
      return;
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const displayId = await generateUniqueDisplayId();
    const [user] = await db.insert(users).values({
      email: body.email,
      passwordHash,
      displayId,
      nickname: body.nickname || body.email.split("@")[0],
    }).returning();

    const token = await signToken({ sub: String(user.id), role: user.role });

    const cookieOpts = getCookieOptions();
    res.cookie(cookieOpts.name, token, cookieOpts);

    res.status(201).json({
      token,
      user: publicUser(user),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[auth] register error:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

// ── POST /auth/login ──
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);

    const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
    if (!user) {
      res.status(401).json({ error: "邮箱或密码错误" });
      return;
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "邮箱或密码错误" });
      return;
    }

    // 更新最后登录时间
    await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

    const token = await signToken({ sub: String(user.id), role: user.role });

    const cookieOpts = getCookieOptions();
    res.cookie(cookieOpts.name, token, cookieOpts);

    res.json({
      token,
      user: publicUser(user),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[auth] login error:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

// ── GET /auth/me ──
authRouter.get("/me", async (req: Request, res: Response) => {
  let user = await getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "未登录" });
    return;
  }
  if (!user.displayId) {
    const displayId = await generateUniqueDisplayId();
    await db.update(users).set({ displayId, updatedAt: new Date() }).where(eq(users.id, user.id));
    user = (await getAuthUser(req))!;
  }
  res.json({ user: publicUser(user) });
});

// ── POST /auth/checkout-register ──
/** 结账页静默注册：新邮箱自动建号并登录；已注册则返回 exists */
authRouter.post("/checkout-register", async (req: Request, res: Response) => {
  try {
    const body = checkoutEmailSchema.parse(req.body);
    const existing = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
    if (existing.length > 0) {
      res.json({ exists: true });
      return;
    }

    const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
    const displayId = await generateUniqueDisplayId();
    const [user] = await db.insert(users).values({
      email: body.email,
      passwordHash,
      displayId,
      nickname: body.email.split("@")[0],
    }).returning();

    const token = await signToken({ sub: String(user.id), role: user.role });
    const cookieOpts = getCookieOptions();
    res.cookie(cookieOpts.name, token, cookieOpts);

    res.status(201).json({
      exists: false,
      token,
      user: publicUser(user),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[auth] checkout-register error:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

// ── POST /auth/checkout-bind ──
/** 结账页「直接使用」已注册邮箱：无密码验证，签发登录态 */
authRouter.post("/checkout-bind", async (req: Request, res: Response) => {
  try {
    const body = checkoutEmailSchema.parse(req.body);
    const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
    if (!user) {
      res.status(404).json({ error: "邮箱未注册" });
      return;
    }

    await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

    const token = await signToken({ sub: String(user.id), role: user.role });
    const cookieOpts = getCookieOptions();
    res.cookie(cookieOpts.name, token, cookieOpts);

    res.json({
      token,
      user: publicUser(user),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[auth] checkout-bind error:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

// ── POST /auth/logout ──
authRouter.post("/logout", (_req: Request, res: Response) => {
  const cookieOpts = getCookieOptions();
  res.clearCookie(cookieOpts.name, {
    ...cookieOpts,
    maxAge: -1,
  });
  res.json({ success: true });
});

// ── PUT /auth/profile ──
authRouter.put("/profile", async (req: Request, res: Response) => {
  const token = extractToken(req.headers.authorization, req.headers.cookie);
  if (!token) {
    res.status(401).json({ error: "未登录" });
    return;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "登录已过期" });
    return;
  }

  try {
    const body = profileSchema.parse(req.body);
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined) updates[key] = value;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "没有需要更新的字段" });
      return;
    }

    await db.update(users).set({ ...updates, updatedAt: new Date() }).where(eq(users.id, Number(payload.sub)));
    const updated = await getAuthUser(req);
    res.json({ success: true, user: updated ? publicUser(updated) : null });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[auth] profile update error:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

authRouter.use("/me/chat", liveChatRouter);
authRouter.use("/me", accountRouter);
