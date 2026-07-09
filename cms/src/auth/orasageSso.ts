import { jwtVerify } from 'jose';
import type { Payload } from 'payload';
import type { User } from '../payload-types';

const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'orasage_token';

export function orasageAdminEmail(orasageUserId: number): string {
  return `orasage-admin-${orasageUserId}@internal.orasage.local`;
}

function jwtSecretKey(): Uint8Array | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export function readCookie(cookieHeader: string, name: string): string | null {
  for (const part of cookieHeader.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name && rest.length > 0) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

import { isStaffRole } from '../../../shared/staff-roles/index';

export async function verifyOrasageAdminToken(
  token: string,
): Promise<{ orasageUserId: number; staffPermissions: string[] } | null> {
  const secret = jwtSecretKey();
  if (!secret) return null;

  try {
    const { payload: claims } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    const sub = claims.sub;
    const role = claims.role;
    const permsRaw = claims.perms;
    if (typeof sub !== 'string' || !isStaffRole(role as string)) return null;
    if (role !== 'admin' && role !== 'content_ops') return null;

    const orasageUserId = Number(sub);
    if (!Number.isFinite(orasageUserId)) return null;

    const staffPermissions = typeof permsRaw === 'string'
      ? permsRaw.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    return { orasageUserId, staffPermissions };
  } catch {
    return null;
  }
}

/** 根据 orasage_token 查找或创建 Payload 用户（需带 email，满足 DB NOT NULL） */
export async function resolveOrasagePayloadUser(
  payload: Payload,
  orasageUserId: number,
  staffPermissions: string[] = [],
): Promise<Record<string, unknown> | null> {
  const email = orasageAdminEmail(orasageUserId);

  const byOrasageId = await payload.find({
    collection: 'users',
    where: { orasageUserId: { equals: orasageUserId } },
    limit: 1,
    overrideAccess: true,
  });

  if (byOrasageId.docs[0]) {
    const doc = byOrasageId.docs[0] as unknown as Record<string, unknown>;
    const updated = await payload.update({
      collection: 'users',
      id: doc.id as string | number,
      data: { staffPermissions } as never,
      overrideAccess: true,
    });
    return updated as unknown as Record<string, unknown>;
  }

  const byEmail = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  });

  if (byEmail.docs[0]) {
    const doc = byEmail.docs[0] as unknown as Record<string, unknown>;
    if (doc.orasageUserId == null) {
      const updated = await payload.update({
        collection: 'users',
        id: doc.id as string | number,
        data: { orasageUserId, staffPermissions } as never,
        overrideAccess: true,
      });
      return updated as unknown as Record<string, unknown>;
    }
    return doc;
  }

  try {
    const created = await payload.create({
      collection: 'users',
      data: {
        email,
        orasageUserId,
        staffPermissions,
      } as never,
      overrideAccess: true,
    });
    return created as unknown as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function resolveUserFromOrasageToken(
  payload: Payload,
  token: string | null | undefined,
): Promise<Record<string, unknown> | null> {
  if (!token) return null;
  const verified = await verifyOrasageAdminToken(token);
  if (!verified) return null;
  return resolveOrasagePayloadUser(payload, verified.orasageUserId, verified.staffPermissions);
}
