import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { ALL_CARDS } from "@/lib/tarot/cards"
import { resolveRequestLang } from "@/lib/i18n/request-lang"
import {
  buildLuckyTip,
  localizeStoredCardType,
  orientationLabel,
  pickDailyCardType,
  pickDailyMessage,
} from "@/lib/tarot/daily-card-content"

function dailySeed(userId: string, today: Date) {
  return today.getTime() + userId.charCodeAt(0)
}

function orientationFromSeed(seed: number): "upright" | "reversed" {
  return Math.abs(seed + 5) % 2 === 0 ? "upright" : "reversed"
}

export async function GET(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const lang = resolveRequestLang(req)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const seed = dailySeed(auth.userId, today)

  const existing = await prisma.dailyCardRecord.findFirst({
    where: { userId: auth.userId, createdAt: { gte: today } },
    orderBy: { createdAt: "desc" },
  })

  const orientation = orientationFromSeed(seed)
  const orientationText = orientationLabel(lang, orientation)
  const cardType = existing
    ? localizeStoredCardType(existing.cardType, lang)
    : pickDailyCardType(seed + 1, lang).label
  const message = pickDailyMessage(seed + 2, lang)
  const luckyTip = buildLuckyTip(seed + 3, lang)

  if (existing) {
    return NextResponse.json({
      cardName: existing.cardName,
      cardType,
      message,
      luckyTip,
      imageUrl: existing.imageUrl,
      orientation,
      orientationText,
      alreadyDrew: true,
    })
  }

  const cardIndex = Math.abs(seed) % ALL_CARDS.length
  const card = ALL_CARDS[cardIndex]
  const storedType = pickDailyCardType(seed + 1, lang).label

  await prisma.dailyCardRecord.create({
    data: {
      userId: auth.userId,
      cardName: card.name,
      cardType: storedType,
      message,
      luckyTip,
    },
  })

  return NextResponse.json({
    cardName: card.name,
    cardType,
    message,
    luckyTip,
    imageUrl: null,
    orientation,
    orientationText,
    alreadyDrew: false,
  })
}
