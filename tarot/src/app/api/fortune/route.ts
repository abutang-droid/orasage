import { NextRequest, NextResponse } from "next/server"
import { generateFortune } from "@/lib/tarot/fortune"

export async function GET(req: NextRequest) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const seed = today.getTime()
  const fortune = generateFortune(seed)
  return NextResponse.json({ ...fortune, date: today.toISOString() })
}
