import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { z } from "zod"

const updateSchema = z.object({ nickname: z.string().min(1).max(50).optional(), gender: z.string().optional(), birthday: z.string().optional(), avatar: z.string().optional() })

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: auth.userId }, select: { id: true, nickname: true, email: true, avatar: true, birthday: true, gender: true } })
  return NextResponse.json({ user })
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 })
  const body = await req.json()
  const data = updateSchema.parse(body)
  const updateData: any = {}
  if (data.nickname !== undefined) updateData.nickname = data.nickname
  if (data.gender !== undefined) updateData.gender = data.gender
  if (data.birthday !== undefined) updateData.birthday = new Date(data.birthday)
  if (data.avatar !== undefined) updateData.avatar = data.avatar
  const user = await prisma.user.update({ where: { id: auth.userId }, data: updateData, select: { id: true, nickname: true, email: true, avatar: true, birthday: true, gender: true } })
  return NextResponse.json({ user })
}
