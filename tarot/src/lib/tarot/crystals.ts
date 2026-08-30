export interface CrystalData {
  element: string
  wuxing: string
  name: string
  spec: string
  description: string
}

export const CRYSTAL_MAP: Record<string, CrystalData> = {
  "火": { element: "火", wuxing: "火", name: "红玛瑙", spec: "8mm×23颗", description: "提升行动力、点燃内在热情，作为勇气的心理锚点" },
  "水": { element: "水", wuxing: "水", name: "黑曜石", spec: "8mm×23颗", description: "情绪稳定、建立边界，守护内心平静" },
  "风": { element: "风", wuxing: "木", name: "绿幽灵", spec: "8mm×23颗", description: "思维清晰、象征生长，提醒事业向光拓展" },
  "土": { element: "土", wuxing: "土", name: "黄水晶", spec: "8mm×23颗", description: "稳固根基、守成安定，作为丰盛意向的文化符号" },
  "major": { element: "大阿卡纳", wuxing: "金", name: "白水晶", spec: "8mm×23颗", description: "全面净化、能量平衡，适合所有场合" },
}

export function recommendCrystal(elements: string[]): CrystalData & { shopSku: string } {
  const counts: Record<string, number> = {}
  for (const e of elements) {
    if (e === "大阿卡纳" || e === "major") continue
    counts[e] = (counts[e] || 0) + 1
  }
  let maxCount = 0, maxElement = "major"
  for (const [el, count] of Object.entries(counts)) {
    if (count > maxCount) { maxCount = count; maxElement = el }
  }
  const crystal = CRYSTAL_MAP[maxElement] || CRYSTAL_MAP["major"]
  const wuxingToSku: Record<string, string> = {
    木: "crystal-wood", 火: "crystal-fire", 土: "crystal-earth", 金: "crystal-metal", 水: "crystal-water",
  }
  return { ...crystal, shopSku: wuxingToSku[crystal.wuxing] ?? "crystal-metal" }
}
