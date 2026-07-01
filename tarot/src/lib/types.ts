export interface TarotCard {
  id: number
  name: string
  nameEn: string
  arcana: "major" | "minor"
  suit?: "wands" | "cups" | "swords" | "pentacles"
  number?: number
  element: string
  wuxing: string
  keywords: string[]
  meaningUp: string
  meaningDown: string
}

export interface DrawnCard {
  position: string
  cardName: string
  orientation: "正位" | "逆位"
  keywords: string
  interpretation: string
}

export interface ReadingResult {
  id: string
  spreadType: string
  question?: string
  cards: DrawnCard[]
  relationships: string
  conclusion: string
  crystalName: string
  createdAt: string
}

export interface DailyFortune {
  love: { text: string; tag: string }
  work: { text: string; tag: string }
  wealth: { text: string; tag: string }
  mood: { text: string; tag: string }
}

export interface TarotTip {
  title: string
  content: string
}

export interface CrystalInfo {
  element: string
  wuxing: string
  name: string
  spec: string
  description: string
}

export interface DailyCard {
  cardName: string
  cardType: string
  message: string
  luckyTip: string
}
