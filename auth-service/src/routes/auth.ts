import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "../db/index.ts";
import { users } from "../db/schema.ts";
import { eq } from "drizzle-orm";
import { extractToken, signToken, verifyToken, getCookieOptions } from "../lib/jwt.ts";
import { getAuthUser, publicUser } from "../lib/auth-user.ts";
import { accountRouter } from "./account.ts";

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
    const [user] = await db.insert(users).values({
      email: body.email,
      passwordHash,
      nickname: body.nickname || body.email.split("@")[0],
    }).returning();

    const token = await signToken({ sub: String(user.id), role: user.role });

    const cookieOpts = getCookieOptions();
    res.cookie(cookieOpts.name, token, cookieOpts);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      },
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
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      },
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
  const user = await getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "未登录" });
    return;
  }
  res.json({ user: publicUser(user) });
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

  const body = req.body;
  const allowedFields = [
    "nickname", "avatarUrl", "birthDate", "birthHour",
    "birthPlaceProvince", "birthPlaceCity", "gender",
    "preferredDeity", "languagePreference",
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "没有需要更新的字段" });
    return;
  }

  await db.update(users).set({ ...updates, updatedAt: new Date() }).where(eq(users.id, Number(payload.sub)));
  const updated = await getAuthUser(req);
  res.json({ success: true, user: updated ? publicUser(updated) : null });
});

authRouter.use("/me", accountRouter);
