import { SignJWT, jwtVerify } from "jose";
import { ENV } from "../env.ts";

const secret = new TextEncoder().encode(ENV.jwtSecret);

import type { StaffRole } from "../../../shared/staff-roles/index.ts";

export interface JwtPayload {
  sub: string;
  role: StaffRole | "user";
  /** 逗号分隔的有效权限点（仅运营员工） */
  perms?: string;
}

/** 签发 JWT */
export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(ENV.jwtExpiresIn)
    .sign(secret);
}

/** 验证 JWT，返回 payload（其他服务共享此 secret 即可自行验证） */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    const { sub, role, perms } = payload as unknown as JwtPayload;
    if (typeof sub !== "string" || !role) return null;
    return { sub, role, perms: typeof perms === "string" ? perms : undefined };
  } catch {
    return null;
  }
}

/** 从 Authorization header 或 cookie 提取 JWT */
export function extractToken(authHeader?: string, cookieHeader?: string): string | null {
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  if (cookieHeader) {
    for (const part of cookieHeader.split(";")) {
      const [name, ...rest] = part.trim().split("=");
      if (name === "orasage_token" && rest.length > 0) {
        return rest.join("=");
      }
    }
  }
  return null;
}

/** 生成 Cookie 配置 */
export function getCookieOptions() {
  return {
    name: "orasage_token",
    httpOnly: true,
    secure: ENV.isProduction,
    sameSite: "lax" as const,
    path: "/",
    domain: ENV.cookieDomain,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  };
}

type CookieClearTarget = {
  clearCookie: (
    name: string,
    options?: {
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: "lax" | "strict" | "none";
      httpOnly?: boolean;
    },
  ) => void;
};

/** 同时清 Domain=.orasage.com 与 host-only（本地 127.0.0.1 手动种的 cookie）。 */
export function clearAuthCookies(res: CookieClearTarget) {
  const { name, path, domain, secure, sameSite, httpOnly } = getCookieOptions();
  res.clearCookie(name, { path, domain, secure, sameSite, httpOnly });
  res.clearCookie(name, { path, secure, sameSite, httpOnly });
  res.clearCookie(name, { path });
}
