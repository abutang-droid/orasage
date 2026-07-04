import { jwtVerify } from 'jose';
import type { AuthStrategy } from 'payload';

const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'orasage_token';

function readCookie(cookieHeader: string, name: string): string | null {
  for (const part of cookieHeader.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name && rest.length > 0) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

function jwtSecretKey(): Uint8Array | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

/** 使用 orasage_token（auth-service 签发，role=admin）单点登录 CMS */
export const orasageAuthStrategy: AuthStrategy = {
  name: 'orasage-jwt',
  authenticate: async ({ payload, headers }) => {
    const secret = jwtSecretKey();
    if (!secret) return { user: null };

    const token = readCookie(headers.get('cookie') ?? '', COOKIE_NAME);
    if (!token) return { user: null };

    try {
      const { payload: claims } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
      const sub = claims.sub;
      const role = claims.role;
      if (typeof sub !== 'string' || role !== 'admin') return { user: null };

      const orasageUserId = Number(sub);
      if (!Number.isFinite(orasageUserId)) return { user: null };

      const existing = await payload.find({
        collection: 'users',
        where: { orasageUserId: { equals: orasageUserId } },
        limit: 1,
        overrideAccess: true,
      });

      if (existing.docs[0]) {
        const doc = existing.docs[0];
        return {
          user: {
            ...doc,
            collection: 'users',
          },
        };
      }

      const email = `orasage-admin-${orasageUserId}@internal.orasage.local`;
      const created = await payload.create({
        collection: 'users',
        data: {
          email,
          orasageUserId,
        } as Record<string, unknown>,
        overrideAccess: true,
      });

      return {
        user: {
          ...created,
          collection: 'users',
        },
      };
    } catch {
      return { user: null };
    }
  },
};
