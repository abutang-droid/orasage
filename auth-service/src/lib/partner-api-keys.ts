import { createHash, randomBytes } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { partnerApiKeys } from "../db/schema.ts";
import {
  isPartnerModuleKey,
  sanitizeApiKeyScopes,
} from "../../../shared/partners/index.ts";
import { listEnabledModuleKeys } from "./partner-scope.ts";

export function hashApiKey(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

export function generateApiKey(): { raw: string; prefix: string; hash: string } {
  const secret = randomBytes(24).toString("base64url");
  const raw = `mk_live_${secret}`;
  return { raw, prefix: raw.slice(0, 16), hash: hashApiKey(raw) };
}

export function formatApiKeyRow(row: typeof partnerApiKeys.$inferSelect) {
  return {
    id: row.id,
    partnerId: row.partnerId,
    name: row.name,
    keyPrefix: row.keyPrefix,
    scopes: row.scopes ?? [],
    status: row.status,
    lastUsedAt: row.lastUsedAt,
    expiresAt: row.expiresAt,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
    revokedAt: row.revokedAt,
  };
}

export async function listApiKeysForPartner(partnerId: string) {
  const rows = await db
    .select()
    .from(partnerApiKeys)
    .where(eq(partnerApiKeys.partnerId, partnerId))
    .orderBy(desc(partnerApiKeys.createdAt));
  return rows.map(formatApiKeyRow);
}

export async function createApiKey(opts: {
  partnerId: string;
  name?: string;
  scopes?: string[];
  createdBy?: number | null;
  expiresAt?: Date | null;
}) {
  const { raw, prefix, hash } = generateApiKey();
  let defaultScopes = opts.scopes;
  if (!defaultScopes) {
    const enabled = await listEnabledModuleKeys(opts.partnerId);
    defaultScopes = [
      "config:read",
      ...enabled
        .filter((m) => isPartnerModuleKey(m) && m !== "platform")
        .map((m) => `module:${m}`),
    ];
  }
  const scopes = sanitizeApiKeyScopes(defaultScopes);
  const [row] = await db
    .insert(partnerApiKeys)
    .values({
      partnerId: opts.partnerId,
      name: opts.name?.trim() || "default",
      keyPrefix: prefix,
      keyHash: hash,
      scopes,
      status: "active",
      createdBy: opts.createdBy ?? null,
      expiresAt: opts.expiresAt ?? null,
    })
    .returning();
  return { key: formatApiKeyRow(row), raw };
}

export async function revokeApiKey(partnerId: string, id: number) {
  const [row] = await db
    .update(partnerApiKeys)
    .set({ status: "revoked", revokedAt: new Date() })
    .where(and(eq(partnerApiKeys.id, id), eq(partnerApiKeys.partnerId, partnerId)))
    .returning();
  return row ? formatApiKeyRow(row) : null;
}

export async function findActiveKeyByRaw(raw: string) {
  const hash = hashApiKey(raw);
  const [row] = await db
    .select()
    .from(partnerApiKeys)
    .where(and(eq(partnerApiKeys.keyHash, hash), eq(partnerApiKeys.status, "active")))
    .limit(1);
  if (!row) return null;
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return null;
  return row;
}

export async function touchApiKeyLastUsed(id: number) {
  await db
    .update(partnerApiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(partnerApiKeys.id, id));
}
