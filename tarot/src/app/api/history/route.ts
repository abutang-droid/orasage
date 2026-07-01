import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 })

  const type = req.nextUrl.searchParams.get("type") || "reading"
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1")
  const limit = 20
  const skip = (page - 1) * limit

  if (type === "daily-card") {
    const [records, total] = await Promise.all([
      prisma.dailyCardRecord.findMany({ where: { userId: auth.userId }, orderBy: { createdAt: "desc" }, take: limit, skip }),
      prisma.dailyCardRecord.count({ where: { userId: auth.userId } }),
    ])
    return NextResponse.json({ records, total, page, totalPages: Math.ceil(total / limit) })
  }

  if (type === "wish") {
    const [records, total] = await Promise.all([
      prisma.wishRecord.findMany({ where: { userId: auth.userId }, orderBy: { createdAt: "desc" }, take: limit, skip }),
      prisma.wishRecord.count({ where: { userId: auth.userId } }),
    ])
    return NextResponse.json({ records, total, page, totalPages: Math.ceil(total / limit) })
  }

  const [records, total] = await Promise.all([
    prisma.readingRecord.findMany({ where: { userId: auth.userId }, orderBy: { createdAt: "desc" }, take: limit, skip }),
    prisma.readingRecord.count({ where: { userId: auth.userId } }),
  ])
  return NextResponse.json({ records, total, page, totalPages: Math.ceil(total / limit) })
}
