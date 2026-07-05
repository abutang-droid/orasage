import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { prisma } from "./prisma"

// JWT_SECRET 与 orasage 生态其他 App（auth-service/shop/main/...）共享同一个值，
// 用于同时验证：1) 本地访客 tarot_token；2) 父应用 orasage_token（跨域统一登录）。
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("Missing required env var: JWT_SECRET")
}
const DEV_SECRET = "tarot-dev-secret-key-change-in-production"
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || DEV_SECRET)
const COOKIE_NAME = "tarot_token"
const PARENT_COOKIE_NAME = process.env.PARENT_AUTH_COOKIE_NAME || "orasage_token"

export interface JwtPayload {
  userId: string
  email: string
}

interface ParentJwtPayload {
  sub: string
  role: "user" | "admin"
}

export async function createToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: ["HS256"] })
    // 修复：此前直接 `as unknown as JwtPayload` 断言，未校验字段实际类型。
    if (typeof payload.userId !== "string" || typeof payload.email !== "string") {
      return null
    }
    return { userId: payload.userId, email: payload.email }
  } catch {
    return null
  }
}

async function verifyParentToken(token: string): Promise<ParentJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: ["HS256"] })
    if (typeof payload.sub !== "string" || (payload.role !== "user" && payload.role !== "admin")) {
      return null
    }
    return { sub: payload.sub, role: payload.role }
  } catch {
    return null
  }
}

/**
 * 解析 orasage 统一登录态（auth.orasage.com 签发的 orasage_token）。
 * 命中时，把父应用用户 id 映射到本地 User（通过 externalId 字段桥接，
 * Prisma schema 中该字段本就是为此预留的），并返回本地用户标识。
 * 未命中（cookie 不存在或校验失败）时返回 null，调用方回退到现有的
 * 本地访客 token 逻辑 —— 因此独立部署（无 orasage 生态）时行为完全不变。
 */
async function getParentBridgedUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies()
  const parentToken = cookieStore.get(PARENT_COOKIE_NAME)?.value
  if (!parentToken) return null

  const parentPayload = await verifyParentToken(parentToken)
  if (!parentPayload) return null

  const externalId = `orasage:${parentPayload.sub}`
  const existing = await prisma.user.findUnique({ where: { externalId } })
  if (existing) {
    return { userId: existing.id, email: existing.email ?? "" }
  }

  const created = await prisma.user.create({
    data: {
      id: `orasage_${parentPayload.sub}`,
      externalId,
      nickname: "旅人",
      email: `${externalId}@orasage.local`,
    },
  })
  return { userId: created.id, email: created.email ?? "" }
}

export async function getAuthUser(): Promise<JwtPayload | null> {
  const parentUser = await getParentBridgedUser()
  if (parentUser) return parentUser

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export type EnsuredAuth = JwtPayload & { newToken?: string }

/**
 * 保证存在可计费的本地用户（访客自动建档）。
 * 与 /api/auth/me 行为一致，供 reading 等接口在 cookie 尚未写入时兜底。
 */
export async function ensureAuthUser(): Promise<EnsuredAuth> {
  const existing = await getAuthUser()
  if (existing) return existing

  const randomId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const email = `${randomId}@manto.guest`
  await prisma.user.create({
    data: { id: randomId, nickname: "旅人", email },
  })
  const token = await createToken({ userId: randomId, email })
  return { userId: randomId, email, newToken: token }
}

export function setAuthCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  }
}
