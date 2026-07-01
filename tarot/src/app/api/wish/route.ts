import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { drawCards } from "@/lib/tarot/draw"

const CONCLUSIONS = ["可行", "蓄力", "暂缓"]
const ADVICE_POOL = [
  "大胆去做，宇宙在支持你的这个心愿。",
  "时机稍纵即逝，今天就行动起来。",
  "再准备一下会更好，不用急着出手。",
  "保持耐心，好事多磨。",
  "跟随直觉走，你的心已经知道答案。",
  "先放一放，过两天再回头看这个决定。",
  "这个方向是对的，但节奏需要放慢一些。",
  "缺少一些关键信息，先收集再行动。",
]

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const { wish } = await req.json()
  if (!wish || wish.length > 200) {
    return NextResponse.json({ error: "心愿内容需在200字以内" }, { status: 400 })
  }

  const result = drawCards("single", wish)
  const card = result.cards[0]
  const seed = Math.abs(result.seed)
  const conclusionIdx = seed % CONCLUSIONS.length
  const adviceIdx = (seed + 1) % ADVICE_POOL.length

  const record = await prisma.wishRecord.create({
    data: { userId: auth.userId, wish, cardName: card.cardName, conclusion: CONCLUSIONS[conclusionIdx], advice: ADVICE_POOL[adviceIdx] },
  })

  return NextResponse.json({ id: record.id, cardName: card.cardName, orientation: card.orientation, conclusion: CONCLUSIONS[conclusionIdx], advice: ADVICE_POOL[adviceIdx], seed: result.seed })
}
