import { jwtVerify } from 'jose';
import { orasageAuthEnv } from './env.ts';

export interface OrasageAuthUser {
  id: number;
  role: 'user' | 'admin';
}

const secret = () => new TextEncoder().encode(orasageAuthEnv.jwtSecret);

/** 从 cookie 字符串或 Request Cookie header 提取 token */
export function extractTokenFromCookie(
  cookieHeader: string | undefined | null,
  cookieName = orasageAuthEnv.jwtCookieName,
): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === cookieName && rest.length > 0) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

export function extractTokenFromAuthHeader(authHeader: string | undefined | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

/** 本地验签 JWT（与 auth-service 共享 JWT_SECRET） */
export async function verifyOrasageToken(token: string): Promise<OrasageAuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] });
    const sub = payload.sub;
    const role = payload.role as OrasageAuthUser['role'] | undefined;
    if (typeof sub !== 'string' || !role) return null;
    const id = Number(sub);
    if (!Number.isFinite(id)) return null;
    return { id, role };
  } catch {
    return null;
  }
}

/** 调 auth-service /verify 端点（可选，用于密钥轮换过渡期） */
export async function verifyViaAuthService(
  token: string,
  authInternalUrl = orasageAuthEnv.authInternalUrl,
): Promise<OrasageAuthUser | null> {
  try {
    const res = await fetch(`${authInternalUrl}/verify`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { valid?: boolean; sub?: string; role?: string };
    if (!data.valid || typeof data.sub !== 'string' || !data.role) return null;
    const id = Number(data.sub);
    if (!Number.isFinite(id)) return null;
    return { id, role: data.role as OrasageAuthUser['role'] };
  } catch {
    return null;
  }
}

export function loginUrl(appOrigin: string, path = '/') {
  const redirect = `${appOrigin.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  return `${orasageAuthEnv.authUrl}/login?redirect=${encodeURIComponent(redirect)}`;
}

export function centerUrl() {
  return `${orasageAuthEnv.authUrl}/center`;
}
