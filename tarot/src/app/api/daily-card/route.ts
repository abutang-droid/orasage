import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { ALL_CARDS } from "@/lib/tarot/cards"

const DAILY_MESSAGES = [
  "今天的能量在告诉你，放轻松，一切都会好起来的。",
  "保持一颗开放的心，今天会有意想不到的美好。",
  "你的努力正在宇宙中引起共鸣，继续前行。",
  "今天适合做让自己开心的事，你值得被温柔对待。",
  "一个小小的改变，会带来一整天的不同。",
  "相信自己，你比你以为的更强大。",
  "今天适合感恩，把注意力放在已经拥有的美好上。",
]

export async function GET(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existing = await prisma.dailyCardRecord.findFirst({
    where: { userId: auth.userId, createdAt: { gte: today } },
    orderBy: { createdAt: "desc" },
  })

  if (existing) {
    return NextResponse.json({ cardName: existing.cardName, cardType: existing.cardType, message: existing.message, luckyTip: existing.luckyTip, imageUrl: existing.imageUrl, alreadyDrew: true })
  }

  const seed = today.getTime() + auth.userId.charCodeAt(0)
  const cardIndex = Math.abs(seed) % ALL_CARDS.length
  const card = ALL_CARDS[cardIndex]
  const types = ["天使卡", "治愈卡", "幸运卡"]
  const cardType = types[Math.abs(seed + 1) % types.length]
  const message = DAILY_MESSAGES[Math.abs(seed + 2) % DAILY_MESSAGES.length]
  const luckyTip = `幸运色：${["金色", "紫色", "蓝色", "红色", "绿色"][Math.abs(seed + 3) % 5]} | 幸运数字：${Math.abs(seed) % 9 + 1}`

  await prisma.dailyCardRecord.create({
    data: { userId: auth.userId, cardName: card.name, cardType, message, luckyTip },
  })

  return NextResponse.json({ cardName: card.name, cardType, message, luckyTip, imageUrl: null, alreadyDrew: false })
}
