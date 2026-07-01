import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { interpretDream } from "@/lib/dream/interpreter"

// POST /api/dream — 解析梦境并保存记录
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { dreamContent, emotion: userEmotion } = body

    if (!dreamContent || dreamContent.trim().length < 5) {
      return NextResponse.json({ error: "请描述你的梦境内容（至少5个字）" }, { status: 400 })
    }

    // 解析梦境
    const result = interpretDream(dreamContent)
    const emotion = userEmotion || result.emotion

    // 获取或创建匿名用户
    let user = await prisma.user.findFirst({ where: { externalId: "anonymous" } })
    if (!user) {
      user = await prisma.user.create({
        data: { nickname: "星月", externalId: "anonymous" }
      })
    }

    // 保存记录
    const record = await prisma.dreamRecord.create({
      data: {
        userId: user.id,
        dreamContent: dreamContent.trim(),
        emotion,
        symbols: result.symbols as any,
        interpretation: result.interpretation,
        subconscious: result.subconscious,
        suggestion: result.suggestion,
      }
    })

    return NextResponse.json({
      id: record.id,
      emotion,
      symbols: result.symbols,
      interpretation: result.interpretation,
      subconscious: result.subconscious,
      suggestion: result.suggestion,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "解析失败，请稍后重试" }, { status: 500 })
  }
}

// GET /api/dream — 获取历史梦境记录
export async function GET(req: NextRequest) {
  try {
    const user = await prisma.user.findFirst({ where: { externalId: "anonymous" } })
    if (!user) return NextResponse.json({ records: [] })

    const records = await prisma.dreamRecord.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ records })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}
