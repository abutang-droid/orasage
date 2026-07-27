import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { verifySiweMessage } from "@worldcoin/minikit-js/siwe";
import { signRequest } from "@worldcoin/idkit-server";
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

function worldIdAction(): string {
  return (process.env.WORLD_ID_ACTION || process.env.NEXT_PUBLIC_WORLD_ID_ACTION || "manto-tarot").trim();
}

function worldRpId(): string {
  return (process.env.WORLD_RP_ID || process.env.NEXT_PUBLIC_WORLD_RP_ID || "").trim();
}

/**
 * RP signing key from Developer Portal (World ID 4.0).
 * Prefer WORLD_RP_SIGNING_KEY; fall back to hex-looking DEV_PORTAL keys if that
 * is what was pasted into the VM env (common mix-up).
 */
function worldRpSigningKey(): string {
  const candidates = [
    process.env.WORLD_RP_SIGNING_KEY,
    process.env.RP_SIGNING_KEY,
    process.env.WORLD_DEV_PORTAL_API_KEY,
    process.env.DEV_PORTAL_API_KEY,
  ];
  for (const raw of candidates) {
    const v = (raw || "").trim();
    if (/^0x[0-9a-fA-F]{64}$/.test(v) || /^[0-9a-fA-F]{64}$/.test(v)) {
      return v.startsWith("0x") ? v : `0x${v}`;
    }
  }
  return "";
}

function nullifierEmail(nullifier: string): string {
  const hex = nullifier.replace(/^0x/i, "").toLowerCase().slice(0, 40);
  return `worldid_${hex || "anon"}@world.local`;
}

function extractNullifier(
  cloud: Record<string, unknown>,
  proof: Record<string, unknown>,
): string | null {
  if (typeof cloud.nullifier === "string" && cloud.nullifier) return cloud.nullifier;
  const results = cloud.results;
  if (Array.isArray(results)) {
    for (const row of results) {
      if (row && typeof row === "object" && typeof (row as { nullifier?: string }).nullifier === "string") {
        const n = (row as { nullifier: string }).nullifier;
        if (n) return n;
      }
    }
  }
  const responses = proof.responses;
  if (Array.isArray(responses)) {
    for (const row of responses) {
      if (row && typeof row === "object" && typeof (row as { nullifier?: string }).nullifier === "string") {
        const n = (row as { nullifier: string }).nullifier;
        if (n) return n;
      }
    }
  }
  return null;
}

/** POST /auth/world/idkit/rp-context — signed RP context for IDKitRequestWidget. */
worldAuthRouter.post("/idkit/rp-context", (_req: Request, res: Response) => {
  try {
    const signingKeyHex = worldRpSigningKey();
    const rpId = worldRpId();
    const action = worldIdAction();
    if (!signingKeyHex) {
      res.status(503).json({
        error: "WORLD_RP_SIGNING_KEY missing",
        code: "rp_signing_key_missing",
      });
      return;
    }
    if (!rpId) {
      res.status(503).json({ error: "WORLD_RP_ID missing", code: "rp_id_missing" });
      return;
    }
    const signed = signRequest({ signingKeyHex, action, ttl: 300 });
    res.json({
      rp_id: rpId,
      nonce: signed.nonce,
      created_at: signed.createdAt,
      expires_at: signed.expiresAt,
      signature: signed.sig,
      action,
      app_id: process.env.WORLD_APP_ID || process.env.NEXT_PUBLIC_WORLD_APP_ID || null,
    });
  } catch (err) {
    console.error("[auth/world/idkit/rp-context]", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to sign RP context",
    });
  }
});

const idkitVerifyBodySchema = z.object({
  // IDKitResult (v3 / v4 uniqueness) — forwarded to Developer Portal verify.
  proof: z.record(z.unknown()),
});

/**
 * POST /auth/world/idkit/verify — cloud-verify World ID proof, upsert user, set cookie.
 */
worldAuthRouter.post("/idkit/verify", async (req: Request, res: Response) => {
  try {
    const body = idkitVerifyBodySchema.parse(req.body);
    const rpId = worldRpId();
    const appId = (process.env.WORLD_APP_ID || process.env.NEXT_PUBLIC_WORLD_APP_ID || "").trim();
    const verifyId = rpId || appId;
    if (!verifyId) {
      res.status(503).json({ error: "WORLD_RP_ID / WORLD_APP_ID missing", code: "rp_id_missing" });
      return;
    }

    const action = worldIdAction();
    const proof = { ...body.proof };
    if (!proof.action && action) proof.action = action;

    const verifyUrl = `https://developer.world.org/api/v4/verify/${verifyId}`;
    const cloudRes = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proof),
    });
    const cloudJson = (await cloudRes.json().catch(() => ({}))) as Record<string, unknown>;
    if (!cloudRes.ok || cloudJson.success === false) {
      console.error("[auth/world/idkit/verify] cloud reject", cloudRes.status, cloudJson);
      res.status(400).json({
        error:
          typeof cloudJson.detail === "string"
            ? cloudJson.detail
            : "World ID verification failed",
        code: typeof cloudJson.code === "string" ? cloudJson.code : "verify_failed",
        results: cloudJson.results,
      });
      return;
    }

    const nullifier = extractNullifier(cloudJson, proof);
    if (!nullifier) {
      res.status(400).json({ error: "Missing nullifier in verify response", code: "no_nullifier" });
      return;
    }

    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.worldNullifier, nullifier))
      .limit(1);

    if (!user) {
      const email = nullifierEmail(nullifier);
      const existingEmail = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingEmail[0]) {
        user = existingEmail[0];
        await db
          .update(users)
          .set({
            worldNullifier: nullifier,
            lastSignedIn: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));
        const [fresh] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
        user = fresh!;
      } else {
        const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
        const displayId = await generateUniqueDisplayId();
        const short = nullifier.replace(/^0x/i, "").slice(0, 6);
        const [created] = await db
          .insert(users)
          .values({
            email,
            passwordHash,
            worldNullifier: nullifier,
            displayId,
            nickname: `World ${short}`,
          })
          .returning();
        user = created;
      }
    } else {
      await db
        .update(users)
        .set({ lastSignedIn: new Date(), updatedAt: new Date() })
        .where(eq(users.id, user.id));
      const [fresh] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
      user = fresh!;
    }

    const token = await signTokenForUser(user);
    const cookieOpts = getCookieOptions();
    res.cookie(cookieOpts.name, token, cookieOpts);
    res.json({
      ok: true,
      token,
      user: publicUser(user),
      nullifier,
      action: typeof cloudJson.action === "string" ? cloudJson.action : action,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[auth/world/idkit/verify]", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "World ID login failed",
    });
  }
});

/** GET /auth/world/status — feature flags for clients */
worldAuthRouter.get("/status", (_req: Request, res: Response) => {
  const signingKey = worldRpSigningKey();
  res.json({
    worldAuthRequired: process.env.WORLD_AUTH_REQUIRED === "true" || process.env.WORLD_AUTH_REQUIRED === "1",
    worldAppId: process.env.WORLD_APP_ID || process.env.NEXT_PUBLIC_WORLD_APP_ID || null,
    worldRpId: worldRpId() || null,
    worldIdAction: worldIdAction(),
    worldIdkitReady: Boolean(signingKey && worldRpId()),
  });
});
