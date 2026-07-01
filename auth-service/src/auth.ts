import { SignJWT, jwtVerify } from 'jose';
import type { Request, Response, NextFunction } from 'express';

const COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? 'orasage_token';
const COOKIE_DOMAIN = process.env.JWT_COOKIE_DOMAIN ?? '.orasage.com';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

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

export async function signToken(userId: number, role: string): Promise<string> {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  if (!payload.sub) throw new Error('invalid token');
  return { sub: payload.sub, role: String(payload.role ?? 'user') };
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    domain: COOKIE_DOMAIN,
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE_MS,
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { domain: COOKIE_DOMAIN, path: '/' });
}

export function getTokenFromRequest(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  const cookie = req.cookies?.[COOKIE_NAME];
  return cookie ?? null;
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ error: 'unauthorized' });
    req.user = await verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
