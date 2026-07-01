import { NextRequest, NextResponse } from "next/server"
import { generateCrystalQuiz } from "@/lib/tarot/crystal-quiz"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cards, question, profile, language = "zh-CN" } = body

    // Local question bank — zero latency, zero failure
    const quizData = generateCrystalQuiz(cards, profile?.name || "")

    return NextResponse.json({ questions: quizData })
  } catch (error) {
    console.error("Crystal quiz error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
