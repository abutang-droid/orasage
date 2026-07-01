import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? 'orasage_token';

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET must be set (min 16 chars)');
  }
  return new TextEncoder().encode(secret);
}

export interface JwtPayload {
  sub: string;
  role: string;
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  if (!payload.sub) throw new Error('invalid token');
  return { sub: payload.sub, role: String(payload.role ?? 'user') };
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return req.cookies.get(COOKIE_NAME)?.value ?? null;
}

export async function getTokenFromCookies(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value ?? null;
}

export async function getAuthUser(req?: NextRequest): Promise<JwtPayload | null> {
  const token = req ? getTokenFromRequest(req) : await getTokenFromCookies();
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(user: JwtPayload | null): JwtPayload {
  if (!user) throw new AuthError('unauthorized');
  return user;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export function loginUrl(redirect?: string): string {
  const authUrl = process.env.AUTH_URL ?? 'https://auth.orasage.com';
  const shopUrl = process.env.SHOP_URL ?? 'https://shop.orasage.com';
  const target = redirect ?? shopUrl;
  return `${authUrl}/login?redirect=${encodeURIComponent(target)}`;
}
