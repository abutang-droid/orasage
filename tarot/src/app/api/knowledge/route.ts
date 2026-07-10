import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { getKnowledgeTipForDay } from "@/lib/tarot/knowledge-tips"
import { resolveRequestLang } from "@/lib/i18n/request-lang"

export async function GET(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const lang = resolveRequestLang(req)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000,
  )
  const tip = getKnowledgeTipForDay(dayOfYear, lang)

  await prisma.knowledgeRead.upsert({
    where: { userId_date: { userId: auth.userId, date: today } },
    update: {},
    create: { userId: auth.userId, title: tip.title, content: tip.content, date: today },
  })

  return NextResponse.json({ title: tip.title, content: tip.content })
}
