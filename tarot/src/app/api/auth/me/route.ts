import { NextRequest, NextResponse } from "next/server"
import { getAuthUser, createToken, setAuthCookie } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET  — return the current user (or create a guest one automatically).
 * Every visitor gets a persistent guest account on first request.
 */
export async function GET() {
  try {
    const auth = await getAuthUser()
    if (auth) {
      const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { id: true, nickname: true, email: true, avatar: true, birthday: true, gender: true, occupation: true, preferredDeity: true },
      })
      if (user) return NextResponse.json({ user })
    }

    // No user — create an auto guest
    const randomId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const user = await prisma.user.create({
      data: { id: randomId, nickname: "旅人", email: `${randomId}@manto.guest` },
      select: { id: true, nickname: true, email: true, avatar: true, birthday: true, gender: true, occupation: true, preferredDeity: true },
    })
    const token = await createToken({ userId: user.id, email: user.email ?? `${randomId}@manto.guest` })
    const res = NextResponse.json({ user })
    res.cookies.set(setAuthCookie(token))
    return res
  } catch (error) {
    console.error("auth/me GET error:", error)
    // Fallback: return guest stub so the frontend never sees an error
    return NextResponse.json({
      user: { id: "guest", nickname: "旅人", email: "guest@tarot.app", birthday: null, gender: null, occupation: null, preferredDeity: null },
    })
  }
}
