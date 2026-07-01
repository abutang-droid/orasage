import { ALL_CARDS, type TarotCardData } from "./cards"

export interface DrawConfig {
  spreadType: string
  positions: { name: string; key: number; uprightBias: number }[]
  question?: string
}

export interface DrawCard {
  position: string
  cardName: string
  cardId: number
  orientation: "正位" | "逆位"
  card: TarotCardData
}

export interface DrawResult {
  seed: number
  spreadType: string
  question: string
  cards: DrawCard[]
  timeFactor: string
}

const SPREADS: Record<string, { name: string; positions: string }> = {
  single:  { name: "单张牌", positions: "当前指引,1,0" },
  three:   { name: "三牌阵", positions: "过去,0,0|现在,1,0|未来,0,1" },
  diamond: { name: "五牌阵", positions: "核心,1,0|根源,0,0|阻力,0,0|潜力,0,0|建议,1,1" },
  moon:    { name: "月亮牌阵", positions: "新月,1,0|上弦,0,0|满月,1,0|下弦,0,0" },
  horseshoe: { name: "马蹄形", positions: "远期过去,0,0|近期过去,0,0|当前,1,0|近期未来,0,0|外部影响,1,0|建议,0,1|结果,1,1" },
  celtic:  { name: "凯尔特十字", positions: "核心,1,0|交叉,0,0|意识目标,0,0|根基过去,0,0|近期过去,1,0|近期未来,0,0|自我,0,0|环境,0,0|希望与恐惧,0,0|结果,1,1" },
}

const TIME_ELEMENTS: Record<string, string[]> = {
  morning:   ["火", "风"],
  afternoon: ["水", "土"],
  night:     ["major"],
}

function getTimeFactor(): string {
  const h = new Date().getHours()
  if (h >= 6 && h < 12) return "morning"
  if (h >= 12 && h < 18) return "afternoon"
  return "night"
}

function makeSeed(question: string): number {
  const data = crypto.randomUUID() + Date.now().toString() + question
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const chr = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return Math.abs(hash)
}

export function drawCards(spreadKey: string, question: string = "", seed?: number, timeFactor?: string): DrawResult {
  const spread = SPREADS[spreadKey]
  if (!spread) throw new Error(`Unknown spread: ${spreadKey}`)

  const finalSeed = seed ?? makeSeed(question)
  const finalFactor = timeFactor ?? getTimeFactor()
  const boosted = TIME_ELEMENTS[finalFactor] ?? []

  let s = finalSeed
  function seededRandom(): number {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }

  const items = spread.positions.split("|")
  const pool = [...ALL_CARDS]
  const cards: DrawCard[] = []

  for (const item of items) {
    const [name, keyStr, uprightStr] = item.split(",")
    const key = parseInt(keyStr)
    const uprightBias = parseInt(uprightStr)

    const weights = pool.map(c => {
      const isMajor = c.arcana === "major"
      let base = isMajor && key > 0 ? 60 / 28 : 1.0
      if (boosted.includes("major") && isMajor) base *= 1.08
      if (boosted.includes(c.element)) base *= 1.08
      return base
    })

    const totalWeight = weights.reduce((a, b) => a + b, 0)
    let rand = seededRandom() * totalWeight
    let pickedIdx = 0
    for (let i = 0; i < weights.length; i++) {
      rand -= weights[i]
      if (rand <= 0) { pickedIdx = i; break }
    }
    const picked = pool[pickedIdx]
    pool.splice(pickedIdx, 1)

    const orientationRand = seededRandom()
    const uprightChance = uprightBias > 0 ? 0.70 : 0.65
    const orientation: "正位" | "逆位" = orientationRand < uprightChance ? "正位" : "逆位"

    cards.push({
      position: name,
      cardName: picked.name,
      cardId: picked.id,
      orientation,
      card: picked,
    })
  }

  return { seed: finalSeed, spreadType: spreadKey, question, cards, timeFactor: finalFactor }
}
