import { type TarotCardData } from "./cards"
import { recommendCrystal, CRYSTAL_MAP } from "./crystals"
import { type DrawCard } from "./draw"

export interface ReadingInterpretation {
  cards: InterpretedCard[]
  relationships: string
  conclusion: string
  crystalName: string
  crystalSpec: string
  crystalDescription: string
}

export interface InterpretedCard {
  position: string
  cardName: string
  orientation: "正位" | "逆位"
  keywords: string
  interpretation: string
}

function pickKeywords(card: TarotCardData): string {
  return card.keywords.slice(0, 3).join("、")
}

function getInterpretation(card: TarotCardData, orientation: string): string {
  return orientation === "正位" ? card.meaningUp : card.meaningDown
}

function analyzeRelationships(cards: DrawCard[]): string {
  if (cards.length < 2) return ""
  const parts: string[] = []
  const elements = cards.map(c => c.card.element)
  const counts: Record<string, number> = {}
  for (const e of elements) counts[e] = (counts[e] || 0) + 1
  const majorCount = cards.filter(c => c.card.arcana === "major").length
  if (majorCount > cards.length / 2) parts.push("大阿卡纳占主导，这段时期对你而言有重要的命运意义。")
  for (const [el, count] of Object.entries(counts)) {
    if (count >= 3) {
      if (el === "火") parts.push("火元素强烈，行动力和激情充沛但需注意急躁。")
      else if (el === "水") parts.push("水元素浓厚，情绪和直觉敏感，适合处理关系议题。")
      else if (el === "风") parts.push("风元素突出，理性和思考力在线，但需避免过度分析。")
      else if (el === "土") parts.push("土元素稳定，务实和安全感是当下的重点。")
    }
  }
  return parts.length > 0 ? parts.join(" ") : "牌面能量各有侧重，整体来看各元素较为均衡。"
}

function synthesizeConclusion(cards: DrawCard[], spreadType: string): string {
  if (spreadType === "single") {
    const c = cards[0]
    return `今日指引来自「${c.cardName}」${c.orientation}。${c.orientation === "正位" ? c.card.meaningUp : c.card.meaningDown}`
  }
  if (spreadType === "three" && cards.length === 3) {
    return `从「${cards[0].cardName}」(${cards[0].orientation})到「${cards[1].cardName}」(${cards[1].orientation})再到「${cards[2].cardName}」(${cards[2].orientation})，整体能量在流动和变化中，${cards[1].card.meaningUp.slice(0, 20)}…`
  }
  return "牌阵能量交织，综合来看这段时间需要你保持觉察和开放的心态。"
}

export function interpretReading(cards: DrawCard[], spreadType: string): ReadingInterpretation {
  const interpreted: InterpretedCard[] = cards.map(c => ({
    position: c.position,
    cardName: c.cardName,
    orientation: c.orientation,
    keywords: pickKeywords(c.card),
    interpretation: getInterpretation(c.card, c.orientation),
  }))
  const allElements = cards.map(c => c.card.arcana === "major" ? "major" : c.card.element)
  const crystal = recommendCrystal(allElements)
  return {
    cards: interpreted,
    relationships: analyzeRelationships(cards),
    conclusion: synthesizeConclusion(cards, spreadType),
    crystalName: crystal.name,
    crystalSpec: crystal.spec,
    crystalDescription: crystal.description,
  }
}
