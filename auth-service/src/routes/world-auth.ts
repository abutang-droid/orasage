import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { verifySiweMessage } from "@worldcoin/minikit-js/siwe";
import { db } from "../db/index.ts";
import { users } from "../db/schema.ts";
import { getCookieOptions } from "../lib/jwt.ts";
import { signTokenForUser } from "../lib/sign-token.ts";
import { publicUser } from "../lib/auth-user.ts";
import { generateUniqueDisplayId } from "../lib/display-id.ts";

export const worldAuthRouter = Router();

const SIWE_COOKIE = "world_siwe_nonce";
const NONCE_TTL_MS = 10 * 60 * 1000;

function randomNonce(): string {
  // MiniKit requires alphanumeric, ≥8 chars, no hyphens.
  return crypto.randomBytes(16).toString("hex");
}

function normalizeAddress(addr: string): string {
  return addr.trim().toLowerCase();
}

function walletEmail(address: string): string {
  return `wallet_${normalizeAddress(address).replace(/^0x/, "")}@world.local`;
}

function siweCookieOpts(maxAgeMs: number) {
  const base = getCookieOptions();
  return {
    httpOnly: true,
    secure: base.secure,
    sameSite: base.sameSite as "lax",
    domain: base.domain,
    path: "/",
    maxAge: maxAgeMs,
  };
}

/** GET /auth/world/nonce — issue SIWE nonce (also set as httpOnly cookie). */
worldAuthRouter.get("/nonce", (_req: Request, res: Response) => {
  const nonce = randomNonce();
  res.cookie(SIWE_COOKIE, nonce, siweCookieOpts(NONCE_TTL_MS));
  res.json({ nonce });
});

const siweBodySchema = z.object({
  payload: z.object({
    address: z.string().min(1),
    message: z.string().min(1),
    signature: z.string().min(1),
  }),
  nonce: z.string().min(8),
  statement: z.string().optional(),
  username: z.string().max(100).optional(),
  profilePictureUrl: z
    .union([z.string().url().max(500), z.literal(""), z.null()])
    .optional()
    .nullable(),
});

/**
 * POST /auth/world/siwe — verify MiniKit walletAuth payload, upsert user, set orasage_token.
 */
worldAuthRouter.post("/siwe", async (req: Request, res: Response) => {
  try {
    const body = siweBodySchema.parse(req.body);
    const cookieNonce = req.cookies?.[SIWE_COOKIE] as string | undefined;
    // Prefer cookie match; if BFF/proxy dropped the cookie, still allow when the
    // signed SIWE message embeds the same nonce (verified below).
    if (cookieNonce && cookieNonce !== body.nonce) {
      res.status(400).json({ error: "Invalid or expired nonce", code: "invalid_nonce" });
      return;
    }

    const verification = await verifySiweMessage(
      body.payload,
      body.nonce,
      body.statement,
    );
    if (!verification.isValid) {
      res.status(401).json({ error: "SIWE verification failed", code: "siwe_invalid" });
      return;
    }

    const address = normalizeAddress(
      verification.siweMessageData.address || body.payload.address,
    );
    if (!/^0x[a-f0-9]{40}$/.test(address)) {
      res.status(400).json({ error: "Invalid wallet address", code: "bad_address" });
      return;
    }

    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.walletAddress, address))
      .limit(1);

    if (!user) {
      const email = walletEmail(address);
      const existingEmail = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingEmail[0]) {
        user = existingEmail[0];
        await db
          .update(users)
          .set({
            walletAddress: address,
            lastSignedIn: new Date(),
            updatedAt: new Date(),
            nickname: body.username || user.nickname || `World ${address.slice(2, 8)}`,
            avatarUrl: body.profilePictureUrl ?? user.avatarUrl,
          })
          .where(eq(users.id, user.id));
        const [fresh] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
        user = fresh!;
      } else {
        const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
        const displayId = await generateUniqueDisplayId();
        const [created] = await db
          .insert(users)
          .values({
            email,
            passwordHash,
            walletAddress: address,
            displayId,
            nickname: body.username || `World ${address.slice(2, 8)}`,
            avatarUrl: body.profilePictureUrl ?? null,
          })
          .returning();
        user = created;
      }
    } else {
      await db
        .update(users)
        .set({
          lastSignedIn: new Date(),
          updatedAt: new Date(),
          nickname: body.username || user.nickname,
          avatarUrl: body.profilePictureUrl ?? user.avatarUrl,
        })
        .where(eq(users.id, user.id));
      const [fresh] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
      user = fresh!;
    }

    const token = await signTokenForUser(user);
    const cookieOpts = getCookieOptions();
    res.cookie(cookieOpts.name, token, cookieOpts);
    res.clearCookie(SIWE_COOKIE, { domain: cookieOpts.domain, path: "/" });

    res.json({
      ok: true,
      token,
      user: publicUser(user),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[auth/world/siwe]", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "SIWE login failed",
    });
  }
});

/** GET /auth/world/status — feature flags for clients */
worldAuthRouter.get("/status", (_req: Request, res: Response) => {
  res.json({
    worldAuthRequired: process.env.WORLD_AUTH_REQUIRED === "true" || process.env.WORLD_AUTH_REQUIRED === "1",
    worldAppId: process.env.WORLD_APP_ID || process.env.NEXT_PUBLIC_WORLD_APP_ID || null,
  });
});
