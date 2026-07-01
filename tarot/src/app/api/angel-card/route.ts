import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { drawAngelCard, recommendAngelCard, ANGEL_CARDS } from "@/lib/angel/cards"

// GET /api/angel-card — 抽取天使牌
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const intention = searchParams.get("intention") || ""
    const userId = searchParams.get("userId") || "anonymous"

    // 根据意图或随机抽取
    const card = intention ? recommendAngelCard(intention) : drawAngelCard(userId)

    return NextResponse.json({
      cardId: card.id,
      cardName: card.name,
      cardNameEn: card.nameEn,
      element: card.element,
      color: card.color,
      symbol: card.symbol,
      affirmation: card.affirmation,
      message: card.message,
      guidance: card.guidance,
      keywords: card.keywords,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "抽取失败" }, { status: 500 })
  }
}

// POST /api/angel-card — 保存天使牌记录
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cardId, intention } = body

    const card = ANGEL_CARDS.find(c => c.id === cardId)
    if (!card) return NextResponse.json({ error: "卡牌不存在" }, { status: 400 })

    // 匿名模式：获取或创建匿名用户
    let user = await prisma.user.findFirst({ where: { externalId: "anonymous" } })
    if (!user) {
      user = await prisma.user.create({
        data: { nickname: "星月", externalId: "anonymous" }
      })
    }

    const record = await prisma.angelDraw.create({
      data: {
        userId: user.id,
        cardId: card.id,
        cardName: card.name,
        intention: intention || null,
        message: card.message,
        affirmation: card.affirmation,
        guidance: card.guidance,
      }
    })

    return NextResponse.json({ success: true, id: record.id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "保存失败" }, { status: 500 })
  }
}
