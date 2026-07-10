import { NextRequest, NextResponse } from "next/server"
import { drawCards } from "@/lib/tarot/draw"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getFreeReadingsRemaining, resolveReadingAccess } from "@/lib/free-readings"
import { normalizeQuestion } from "@/lib/reading-stable"

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

    const auth = await getAuthUser()
    const access = await resolveReadingAccess(auth?.userId ?? null, orderNo)
    if (!access.ok) {
      return NextResponse.json(
        {
          error: "paywall",
          freeReadingsRemaining: 0,
          sku: access.sku,
        },
        { status: 402 },
      )
    }

    const spreadKey = spreadType === "single" ? "single" : "three"
    const questionNorm = normalizeQuestion(question) || "今日整体运势"

    const result = drawCards(spreadKey, questionNorm, undefined, "afternoon")

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

    const readingId = auth ? undefined : `r_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    if (auth) {
      const row = await prisma.readingRecord.create({
        data: {
          userId: auth.userId,
          spreadType: spreadKey,
          question: questionNorm,
          cards,
        },
      })

      return NextResponse.json({
        readingId: row.id,
        cards,
        question: questionNorm,
        free: access.source !== "paid_order",
        accessSource: access.source,
        freeReadingsRemaining: access.remaining,
        cached: false,
      })
    }

    return NextResponse.json({
      readingId,
      cards,
      question: questionNorm,
      free: access.source !== "paid_order",
      accessSource: access.source,
      freeReadingsRemaining: null,
      cached: false,
    })
  } catch (error) {
    console.error("Reading API error:", error)
    return NextResponse.json({ error: "Failed to start reading" }, { status: 500 })
  }
}
