export interface CrystalData {
  element: string
  wuxing: string
  name: string
  spec: string
  description: string
}

export const CRYSTAL_MAP: Record<string, CrystalData> = {
  "火": { element: "火", wuxing: "火", name: "红玛瑙", spec: "8mm×23颗", description: "提升行动力、事业突破，点燃内在热情" },
  "水": { element: "水", wuxing: "水", name: "黑曜石", spec: "8mm×23颗", description: "情绪稳定、辟邪护身，守护内心平静" },
  "风": { element: "风", wuxing: "木", name: "绿幽灵", spec: "8mm×23颗", description: "思维清晰、招正财，助力事业发展" },
  "土": { element: "土", wuxing: "土", name: "黄水晶", spec: "8mm×23颗", description: "财运提升、贵人运，吸引丰盛能量" },
  "major": { element: "大阿卡纳", wuxing: "金", name: "白水晶", spec: "8mm×23颗", description: "全面净化、能量平衡，适合所有场合" },
}

export function recommendCrystal(elements: string[]): CrystalData {
  const counts: Record<string, number> = {}
  for (const e of elements) {
    if (e === "大阿卡纳" || e === "major") continue
    counts[e] = (counts[e] || 0) + 1
  }
  let maxCount = 0, maxElement = "major"
  for (const [el, count] of Object.entries(counts)) {
    if (count > maxCount) { maxCount = count; maxElement = el }
  }
  return CRYSTAL_MAP[maxElement] || CRYSTAL_MAP["major"]
}
