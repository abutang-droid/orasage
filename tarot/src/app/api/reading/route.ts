import { NextRequest, NextResponse } from "next/server"
import { drawCards } from "@/lib/tarot/draw"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { question = "", spreadType = "three" } = body

    const spreadKey = spreadType === "single" ? "single" : "three"
    const result = drawCards(spreadKey, question || "今日整体运势")

    const cards = result.cards.map((c, i) => {
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

    return NextResponse.json({
      readingId,
      cards,
      question: question || "今日整体运势",
      free: true,
    })
  } catch (error) {
    console.error("Reading API error:", error)
    return NextResponse.json({ error: "Failed to start reading" }, { status: 500 })
  }
}
