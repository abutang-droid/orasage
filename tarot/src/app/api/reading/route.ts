import { NextRequest, NextResponse } from "next/server"
import { drawCards } from "@/lib/tarot/draw"
import { ensureAuthUser, getAuthUser, setAuthCookie } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getFreeReadingsRemaining, resolveReadingAccess } from "@/lib/free-readings"

function jsonWithGuestCookie<T extends object>(payload: T, init?: { status?: number; newToken?: string }) {
  const res = NextResponse.json(payload, { status: init?.status })
  if (init?.newToken) res.cookies.set(setAuthCookie(init.newToken))
  return res
}

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) {
    return NextResponse.json({ freeReadingsRemaining: null, requiresAuth: false })
  }
  const remaining = await getFreeReadingsRemaining(auth.userId)
  return NextResponse.json({ freeReadingsRemaining: remaining, requiresAuth: true })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { question = "", spreadType = "three", orderNo = null } = body

    const ensured = await ensureAuthUser()
    const access = await resolveReadingAccess(ensured.userId, orderNo)
    if (!access.ok) {
      return jsonWithGuestCookie(
        {
          error: "paywall",
          freeReadingsRemaining: 0,
          sku: access.sku,
        },
        { status: 402, newToken: ensured.newToken },
      )
    }

    const spreadKey = spreadType === "single" ? "single" : "three"
    const result = drawCards(spreadKey, question || "今日整体运势")

    const cards = result.cards.map((c) => {
      const pos = c.position
      return {
        position: pos,
        positionLabel: pos === "past" ? "过去" : pos === "present" ? "现在" : pos === "future" ? "未来" : "此刻",
        cardName: c.cardName,
        cardNameEn: c.card?.nameEn || c.cardName,
        cardId: c.cardId,
        orientation: c.orientation,
        element: c.card?.element || "major",
        revealed: false,
        interpretation: "",
        mantra: "",
      }
    })

    const readingId = `r_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    await prisma.readingRecord.create({
      data: {
        userId: ensured.userId,
        spreadType: spreadKey,
        question: question || "今日整体运势",
        cards,
      },
    })

    return jsonWithGuestCookie(
      {
        readingId,
        cards,
        question: question || "今日整体运势",
        free: access.source !== "paid_order",
        accessSource: access.source,
        freeReadingsRemaining: access.remaining,
      },
      { newToken: ensured.newToken },
    )
  } catch (error) {
    console.error("Reading API error:", error)
    return NextResponse.json({ error: "Failed to start reading" }, { status: 500 })
  }
}
