import { SignJWT, jwtVerify } from "jose";
import { ENV } from "../env.ts";

const secret = new TextEncoder().encode(ENV.jwtSecret);

import type { StaffRole } from "../../../shared/staff-roles/index.ts";

export interface JwtPayload {
  sub: string;
  role: StaffRole | "user";
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
    const { sub, role } = payload as unknown as JwtPayload;
    if (typeof sub !== "string" || !role) return null;
    return { sub, role };
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
