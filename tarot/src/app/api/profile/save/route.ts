import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

const profileSchema = z.object({
  name: z.string().optional(),
  birthdate: z.string().optional(),
  gender: z.string().optional(),
  occupation: z.string().optional(),
  preferredDeity: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = profileSchema.parse(body)

    const auth = await getAuthUser()
    if (!auth) {
      // Fallback: store profile via browser localStorage only
      // Return success so the client cache works offline
      return NextResponse.json({ saved: true, offline: true })
    }

    const update: Record<string, any> = {}
    if (data.name) update.nickname = data.name
    if (data.birthdate) update.birthday = new Date(data.birthdate)
    if (data.gender) update.gender = data.gender
    if (data.occupation) update.occupation = data.occupation
    if (data.preferredDeity) update.preferredDeity = data.preferredDeity

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ saved: false, reason: "no fields to update" })
    }

    await prisma.user.update({ where: { id: auth.userId }, data: update })
    return NextResponse.json({ saved: true, fields: Object.keys(update) })
  } catch (error) {
    console.error("profile/save error:", error)
    return NextResponse.json({ saved: false, error: "failed" }, { status: 500 })
  }
}
