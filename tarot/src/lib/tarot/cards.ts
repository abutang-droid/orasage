export interface TarotCardData {
  id: number
  name: string         // zh-CN
  nameEn: string
  namePt: string       // Português
  nameEs: string       // Español
  arcana: "major" | "minor"
  suit?: "wands" | "cups" | "swords" | "pentacles"
  number?: number
  element: string
  wuxing: string
  keywords: string[]
  meaningUp: string
  meaningDown: string
  symbol: string
  imageUrl: string
}

// ─── Major Arcana name tables ─────────────────────────────────────
const MAJOR_PT: Record<number, string> = {
  0: "O Louco", 1: "O Mago", 2: "A Sacerdotisa", 3: "A Imperatriz",
  4: "O Imperador", 5: "O Hierofante", 6: "Os Enamorados", 7: "O Carro",
  8: "A Força", 9: "O Eremita", 10: "A Roda da Fortuna", 11: "A Justiça",
  12: "O Enforcado", 13: "A Morte", 14: "A Temperança", 15: "O Diabo",
  16: "A Torre", 17: "A Estrela", 18: "A Lua", 19: "O Sol",
  20: "O Julgamento", 21: "O Mundo",
}

const MAJOR_ES: Record<number, string> = {
  0: "El Loco", 1: "El Mago", 2: "La Sacerdotisa", 3: "La Emperatriz",
  4: "El Emperador", 5: "El Hierofante", 6: "Los Enamorados", 7: "El Carro",
  8: "La Fuerza", 9: "El Ermitaño", 10: "La Rueda de la Fortuna", 11: "La Justicia",
  12: "El Colgado", 13: "La Muerte", 14: "La Templanza", 15: "El Diablo",
  16: "La Torre", 17: "La Estrella", 18: "La Luna", 19: "El Sol",
  20: "El Juicio", 21: "El Mundo",
}

// ─── Minor Arcana suit/rank tables ────────────────────────────────
const SUIT_PT: Record<string, string> = { wands: "Paus", cups: "Copas", swords: "Espadas", pentacles: "Ouros" }
const SUIT_ES: Record<string, string> = { wands: "Bastos", cups: "Copas", swords: "Espadas", pentacles: "Oros" }
const RANK_PT: Record<string, string> = {
  "1": "Ás", "2": "Dois", "3": "Três", "4": "Quatro", "5": "Cinco",
  "6": "Seis", "7": "Sete", "8": "Oito", "9": "Nove", "10": "Dez",
  Page: "Valete", Knight: "Cavaleiro", Queen: "Rainha", King: "Rei",
}
const RANK_ES: Record<string, string> = {
  "1": "As", "2": "Dos", "3": "Tres", "4": "Cuatro", "5": "Cinco",
  "6": "Seis", "7": "Siete", "8": "Ocho", "9": "Nueve", "10": "Diez",
  Page: "Sota", Knight: "Caballero", Queen: "Reina", King: "Rey",
}

function minorName(
  number: number | undefined,
  rank: string | undefined,
  suit: string,
  table: Record<string, string>,
  suitTable: Record<string, string>,
): string {
  const key = rank || (number ? String(number) : "?")
  const rankName = table[key] || key
  return `${rankName} de ${suitTable[suit] || suit}`
}

// ─── Card definitions ─────────────────────────────────────────────
export const ALL_CARDS: TarotCardData[] = [
  // ═══ 大阿卡纳 22 张 ═══
  { id: 0, name: "愚者", nameEn: "The Fool", namePt: MAJOR_PT[0], nameEs: MAJOR_ES[0],
    arcana: "major", number: 0, element: "风", wuxing: "木",
    keywords: ["新的开始", "冒险", "自由"],
    meaningUp: "新的旅程正在召唤你，勇敢迈出第一步，信任生命的安排。",
    meaningDown: "是否在逃避某个重要的决定？小心鲁莽行事带来的后果。",
    symbol: "fool", imageUrl: "/cards/0.webp" },

  { id: 1, name: "魔术师", nameEn: "The Magician", namePt: MAJOR_PT[1], nameEs: MAJOR_ES[1],
    arcana: "major", number: 1, element: "风", wuxing: "木",
    keywords: ["创造力", "自信", "行动力"],
    meaningUp: "你拥有完成目标所需的一切资源，现在就去行动。",
    meaningDown: "才能被浪费或方向不对，需要重新审视你的策略。",
    symbol: "magician", imageUrl: "/cards/1.webp" },

  { id: 2, name: "女祭司", nameEn: "The High Priestess", namePt: MAJOR_PT[2], nameEs: MAJOR_ES[2],
    arcana: "major", number: 2, element: "水", wuxing: "水",
    keywords: ["直觉", "潜意识", "内在智慧"],
    meaningUp: "静下来倾听内心的声音，答案已经在你的潜意识里。",
    meaningDown: "忽略了直觉信号，或过度沉浸在幻想中。",
    symbol: "highpriestess", imageUrl: "/cards/2.webp" },

  { id: 3, name: "女皇", nameEn: "The Empress", namePt: MAJOR_PT[3], nameEs: MAJOR_ES[3],
    arcana: "major", number: 3, element: "土", wuxing: "土",
    keywords: ["丰收", "滋养", "丰盛"],
    meaningUp: "这是一个收获和成长的时期，享受生命的丰盛与美好。",
    meaningDown: "过度依赖他人，或在创造力上遇到阻碍。",
    symbol: "empress", imageUrl: "/cards/3.webp" },

  { id: 4, name: "皇帝", nameEn: "The Emperor", namePt: MAJOR_PT[4], nameEs: MAJOR_ES[4],
    arcana: "major", number: 4, element: "火", wuxing: "火",
    keywords: ["权威", "稳定", "秩序"],
    meaningUp: "建立结构和规则，用理性和纪律来管理你的生活。",
    meaningDown: "过于固执或滥用权力，需要更多的灵活性。",
    symbol: "emperor", imageUrl: "/cards/4.webp" },

  { id: 5, name: "教皇", nameEn: "The Hierophant", namePt: MAJOR_PT[5], nameEs: MAJOR_ES[5],
    arcana: "major", number: 5, element: "土", wuxing: "土",
    keywords: ["传统", "教导", "精神指引"],
    meaningUp: "寻求导师或传统智慧的指引，遵循已被验证的道路。",
    meaningDown: "挑战权威或旧有规则，寻找属于自己的信仰。",
    symbol: "hierophant", imageUrl: "/cards/5.webp" },

  { id: 6, name: "恋人", nameEn: "The Lovers", namePt: MAJOR_PT[6], nameEs: MAJOR_ES[6],
    arcana: "major", number: 6, element: "风", wuxing: "木",
    keywords: ["选择", "爱情", "和谐"],
    meaningUp: "一段重要的关系或选择摆在面前，跟随你的真心。",
    meaningDown: "关系中的不平衡或价值观冲突需要面对。",
    symbol: "lovers", imageUrl: "/cards/6.webp" },

  { id: 7, name: "战车", nameEn: "The Chariot", namePt: MAJOR_PT[7], nameEs: MAJOR_ES[7],
    arcana: "major", number: 7, element: "水", wuxing: "水",
    keywords: ["胜利", "意志力", "征服"],
    meaningUp: "靠决心和自律克服障碍，胜利在望。",
    meaningDown: "方向混乱或缺乏自律，需要停下来重新定位。",
    symbol: "chariot", imageUrl: "/cards/7.webp" },

  { id: 8, name: "力量", nameEn: "Strength", namePt: MAJOR_PT[8], nameEs: MAJOR_ES[8],
    arcana: "major", number: 8, element: "火", wuxing: "火",
    keywords: ["勇气", "内在力量", "温柔"],
    meaningUp: "真正的力量来自内心的温柔与耐心，而非蛮力。",
    meaningDown: "自我怀疑或内在的恐惧正在消耗你的能量。",
    symbol: "strength", imageUrl: "/cards/8.webp" },

  { id: 9, name: "隐士", nameEn: "The Hermit", namePt: MAJOR_PT[9], nameEs: MAJOR_ES[9],
    arcana: "major", number: 9, element: "土", wuxing: "土",
    keywords: ["内省", "寻找真相", "独处"],
    meaningUp: "独处是必要的，向内探索才能找到真正的答案。",
    meaningDown: "过度孤立或拒绝接受他人的帮助。",
    symbol: "hermit", imageUrl: "/cards/9.webp" },

  { id: 10, name: "命运之轮", nameEn: "Wheel of Fortune", namePt: MAJOR_PT[10], nameEs: MAJOR_ES[10],
    arcana: "major", number: 10, element: "火", wuxing: "火",
    keywords: ["变化", "循环", "机遇"],
    meaningUp: "命运的转折点到来，好运正在向你靠近。",
    meaningDown: "不顺的周期，但记住变化是唯一的不变。",
    symbol: "wheel", imageUrl: "/cards/10.webp" },

  { id: 11, name: "正义", nameEn: "Justice", namePt: MAJOR_PT[11], nameEs: MAJOR_ES[11],
    arcana: "major", number: 11, element: "风", wuxing: "木",
    keywords: ["公平", "真相", "因果"],
    meaningUp: "你的选择将带来相应的结果，公正会得到伸张。",
    meaningDown: "不公正或逃避责任，需要诚实地面对自己。",
    symbol: "justice", imageUrl: "/cards/11.webp" },

  { id: 12, name: "倒吊人", nameEn: "The Hanged Man", namePt: MAJOR_PT[12], nameEs: MAJOR_ES[12],
    arcana: "major", number: 12, element: "水", wuxing: "水",
    keywords: ["牺牲", "新视角", "暂停"],
    meaningUp: "换一个角度看问题，当下的暂停是为了更好的前进。",
    meaningDown: "陷入停滞或做无谓的牺牲，需要打破僵局。",
    symbol: "hangedman", imageUrl: "/cards/12.webp" },

  { id: 13, name: "死神", nameEn: "Death", namePt: MAJOR_PT[13], nameEs: MAJOR_ES[13],
    arcana: "major", number: 13, element: "水", wuxing: "水",
    keywords: ["结束", "转变", "重生"],
    meaningUp: "旧的篇章必须结束，新的开始才能到来。放下。",
    meaningDown: "抗拒改变，执着于已经结束的事物。",
    symbol: "death", imageUrl: "/cards/13.webp" },

  { id: 14, name: "节制", nameEn: "Temperance", namePt: MAJOR_PT[14], nameEs: MAJOR_ES[14],
    arcana: "major", number: 14, element: "火", wuxing: "火",
    keywords: ["平衡", "调和", "耐心"],
    meaningUp: "保持平衡和耐心，找到适度的节奏。",
    meaningDown: "极端失衡或缺乏耐心，需要找回和谐。",
    symbol: "temperance", imageUrl: "/cards/14.webp" },

  { id: 15, name: "恶魔", nameEn: "The Devil", namePt: MAJOR_PT[15], nameEs: MAJOR_ES[15],
    arcana: "major", number: 15, element: "土", wuxing: "土",
    keywords: ["束缚", "执念", "物质"],
    meaningUp: "觉察那些限制你的执念和习惯，你有能力挣脱。",
    meaningDown: "正在摆脱不健康的关系或依赖，重获自由。",
    symbol: "devil", imageUrl: "/cards/15.webp" },

  { id: 16, name: "高塔", nameEn: "The Tower", namePt: MAJOR_PT[16], nameEs: MAJOR_ES[16],
    arcana: "major", number: 16, element: "火", wuxing: "火",
    keywords: ["崩塌", "觉醒", "剧变"],
    meaningUp: "突如其来的变化打破了旧有结构，但这是必要的重建。",
    meaningDown: "抗拒不可避免的改变，或灾难已经过去。",
    symbol: "tower", imageUrl: "/cards/16.webp" },

  { id: 17, name: "星星", nameEn: "The Star", namePt: MAJOR_PT[17], nameEs: MAJOR_ES[17],
    arcana: "major", number: 17, element: "风", wuxing: "木",
    keywords: ["希望", "灵感", "平静"],
    meaningUp: "希望的光芒在闪烁，保持信念，一切都会好起来的。",
    meaningDown: "失去信心或方向感，重新连接内在的希望。",
    symbol: "star", imageUrl: "/cards/17.webp" },

  { id: 18, name: "月亮", nameEn: "The Moon", namePt: MAJOR_PT[18], nameEs: MAJOR_ES[18],
    arcana: "major", number: 18, element: "水", wuxing: "水",
    keywords: ["幻觉", "恐惧", "潜意识"],
    meaningUp: "事情并非表面那样，小心幻觉和未知的恐惧。",
    meaningDown: "正在走出困惑，真相逐渐显露。",
    symbol: "moon", imageUrl: "/cards/18.webp" },

  { id: 19, name: "太阳", nameEn: "The Sun", namePt: MAJOR_PT[19], nameEs: MAJOR_ES[19],
    arcana: "major", number: 19, element: "火", wuxing: "火",
    keywords: ["喜悦", "成功", "活力"],
    meaningUp: "阳光灿烂的日子，成功和喜悦围绕着你。",
    meaningDown: "快乐被暂时遮蔽，但光明就在不远处。",
    symbol: "sun", imageUrl: "/cards/19.webp" },

  { id: 20, name: "审判", nameEn: "Judgement", namePt: MAJOR_PT[20], nameEs: MAJOR_ES[20],
    arcana: "major", number: 20, element: "火", wuxing: "火",
    keywords: ["觉醒", "重生", "召唤"],
    meaningUp: "过去的一切有了答案，新的阶段正在开启。",
    meaningDown: "自我批判或拒绝面对内心的召唤。",
    symbol: "judgement", imageUrl: "/cards/20.webp" },

  { id: 21, name: "世界", nameEn: "The World", namePt: MAJOR_PT[21], nameEs: MAJOR_ES[21],
    arcana: "major", number: 21, element: "土", wuxing: "土",
    keywords: ["完成", "圆满", "达成"],
    meaningUp: "一个周期圆满完成，你达到了新的高度。",
    meaningDown: "离完成还差最后一步，不要放弃。",
    symbol: "world", imageUrl: "/cards/21.webp" },

  // ═══ 权杖 14 张 ═══
  ...[
    { id: 22, name: "权杖Ace", nameEn: "Ace of Wands", number: 1, rank: "1", kw: ["新开始", "灵感", "创造火花"], up: "一个充满激情的新机会正在萌芽，抓住它。", down: "创意受阻或缺乏动力，需要重新点燃热情。", sym: "wands_ace" },
    { id: 23, name: "权杖二", nameEn: "Two of Wands", number: 2, rank: "2", kw: ["规划", "未来", "选择"], up: "站在选择的十字路口，大胆规划你的未来。", down: "恐惧未知而不敢行动，或计划过于宏大不切实际。", sym: "wands_2" },
    { id: 24, name: "权杖三", nameEn: "Three of Wands", number: 3, rank: "3", kw: ["远见", "探索", "扩张"], up: "你的努力开始扩展，前方的路比想象中更广阔。", down: "进展缓慢或需要调整计划方向。", sym: "wands_3" },
    { id: 25, name: "权杖四", nameEn: "Four of Wands", number: 4, rank: "4", kw: ["庆祝", "稳定", "归属"], up: "值得庆祝的时刻，家庭或团队带来温暖和归属感。", down: "小冲突打破了和谐，需要修复关系。", sym: "wands_4" },
    { id: 26, name: "权杖五", nameEn: "Five of Wands", number: 5, rank: "5", kw: ["竞争", "冲突", "挑战"], up: "激烈的竞争或意见分歧，需要用建设性的方式解决。", down: "避免冲突或已找到和平解决方案。", sym: "wands_5" },
    { id: 27, name: "权杖六", nameEn: "Six of Wands", number: 6, rank: "6", kw: ["胜利", "认可", "赞誉"], up: "你的努力得到了认可，享受属于你的高光时刻。", down: "缺乏认可或成功之后的自满需要警惕。", sym: "wands_6" },
    { id: 28, name: "权杖七", nameEn: "Seven of Wands", number: 7, rank: "7", kw: ["防守", "坚持", "勇气"], up: "面对挑战不要退缩，捍卫你的立场和信念。", down: "力不从心或感到不堪重负，需要寻求支援。", sym: "wands_7" },
    { id: 29, name: "权杖八", nameEn: "Eight of Wands", number: 8, rank: "8", kw: ["速度", "进展", "消息"], up: "事情正在快速推进，好消息即将到来。", down: "进度延迟或沟通不畅，需要耐心等待。", sym: "wands_8" },
    { id: 30, name: "权杖九", nameEn: "Nine of Wands", number: 9, rank: "9", kw: ["韧性", "坚持", "最后冲刺"], up: "曙光就在眼前，再坚持一下就能到达终点。", down: "精疲力竭或失去动力，需要休息充电。", sym: "wands_9" },
    { id: 31, name: "权杖十", nameEn: "Ten of Wands", number: 10, rank: "10", kw: ["压力", "负担", "过度"], up: "承担了太多责任，是时候放下一些了。", down: "学会放手或委派任务，不要做独行侠。", sym: "wands_10" },
    { id: 32, name: "权杖侍从", nameEn: "Page of Wands", rank: "Page", kw: ["热情", "探索", "冒险精神"], up: "带着好奇心和热情去探索新领域，机会就在眼前。", down: "冲动行事或缺乏方向感，需要更多的计划。", sym: "wands_page" },
    { id: 33, name: "权杖骑士", nameEn: "Knight of Wands", rank: "Knight", kw: ["行动", "冒险", "魅力"], up: "充满活力地向前冲，你的热情会感染周围的人。", down: "鲁莽冲动或虎头蛇尾，需要更多的耐心和坚持。", sym: "wands_knight" },
    { id: 34, name: "权杖王后", nameEn: "Queen of Wands", rank: "Queen", kw: ["自信", "热情", "领导力"], up: "用你的热情和魅力去感染和激励他人，你天生是领导者。", down: "自我中心或嫉妒心作祟，需要更多的包容。", sym: "wands_queen" },
    { id: 35, name: "权杖国王", nameEn: "King of Wands", rank: "King", kw: ["远见", "领导", "创业"], up: "你是一个有远见的领导者，用你的热情去实现宏大的目标。", down: "独断专行或傲慢自大，需要倾听他人的意见。", sym: "wands_king" },
  ].map(c => ({
    id: c.id, name: c.name, nameEn: c.nameEn,
    namePt: minorName(c.number, c.rank, "wands", RANK_PT, SUIT_PT),
    nameEs: minorName(c.number, c.rank, "wands", RANK_ES, SUIT_ES),
    arcana: "minor" as const, suit: "wands" as const, number: c.number,
    element: "火", wuxing: "火", keywords: c.kw,
    meaningUp: c.up, meaningDown: c.down, symbol: c.sym,
    imageUrl: `/cards/${c.id}.webp`,
  })),

  // ═══ 圣杯 14 张 ═══
  ...[
    { id: 36, name: "圣杯Ace", nameEn: "Ace of Cups", number: 1, rank: "1", kw: ["爱", "情感", "新关系"], up: "爱的新芽正在绽放，敞开心扉去感受吧。", down: "情感压抑或爱意无法流动，需要疏通情绪。", sym: "cups_ace" },
    { id: 37, name: "圣杯二", nameEn: "Two of Cups", number: 2, rank: "2", kw: ["联结", "伴侣", "和谐"], up: "两颗心灵的美好相遇，一段充满爱与理解的关系。", down: "关系中出现裂痕，需要重建沟通和信任。", sym: "cups_2" },
    { id: 38, name: "圣杯三", nameEn: "Three of Cups", number: 3, rank: "3", kw: ["庆祝", "友谊", "喜悦"], up: "与挚友共庆，生命中充满了值得感恩的美好时刻。", down: "社交圈中的八卦或过度放纵，需要节制。", sym: "cups_3" },
    { id: 39, name: "圣杯四", nameEn: "Four of Cups", number: 4, rank: "4", kw: ["冥想", "重新评估", "冷漠"], up: "暂时退出，重新审视你真正想要的是什么。", down: "从冷漠中走出，重新对生活敞开心扉。", sym: "cups_4" },
    { id: 40, name: "圣杯五", nameEn: "Five of Cups", number: 5, rank: "5", kw: ["失落", "悲伤", "遗憾"], up: "允许自己悲伤，但别忘了还有未打翻的杯子。", down: "从过去的伤痛中走出，接受并向前看。", sym: "cups_5" },
    { id: 41, name: "圣杯六", nameEn: "Six of Cups", number: 6, rank: "6", kw: ["怀旧", "童年", "纯真"], up: "美好的回忆带来温暖，或来自过去的人重新出现。", down: "活在过去的美好中，需要面对当下的现实。", sym: "cups_6" },
    { id: 42, name: "圣杯七", nameEn: "Seven of Cups", number: 7, rank: "7", kw: ["幻想", "选择", "迷惑"], up: "面对众多选择，需要分辨哪些是真实的机会，哪些是幻觉。", down: "从幻想中清醒，做出务实的选择。", sym: "cups_7" },
    { id: 43, name: "圣杯八", nameEn: "Eight of Cups", number: 8, rank: "8", kw: ["离开", "寻求更多", "放弃"], up: "是时候离开那些不再滋养你的事物，去寻找更深的意义。", down: "害怕放弃或正在重新考虑是否要离开。", sym: "cups_8" },
    { id: 44, name: "圣杯九", nameEn: "Nine of Cups", number: 9, rank: "9", kw: ["满足", "愿望成真", "幸福"], up: "你的愿望即将实现，享受这份来之不易的满足感。", down: "物质满足但内心空虚，需要寻找更深层的幸福。", sym: "cups_9" },
    { id: 45, name: "圣杯十", nameEn: "Ten of Cups", number: 10, rank: "10", kw: ["圆满", "家庭幸福", "和谐"], up: "家庭和关系达到圆满的状态，这是真正的幸福。", down: "家庭不和谐或理想与现实的落差，需要努力修复。", sym: "cups_10" },
    { id: 46, name: "圣杯侍从", nameEn: "Page of Cups", rank: "Page", kw: ["直觉", "创意", "情感信息"], up: "一个充满创意和直觉的灵魂，带来意外的情感惊喜。", down: "情感不成熟或过于敏感，需要更多的情绪管理。", sym: "cups_page" },
    { id: 47, name: "圣杯骑士", nameEn: "Knight of Cups", rank: "Knight", kw: ["浪漫", "魅力", "理想主义"], up: "带着浪漫和理想追求你的梦想，用心去感受。", down: "过于理想化或情绪化，需要更多的实际行动。", sym: "cups_knight" },
    { id: 48, name: "圣杯王后", nameEn: "Queen of Cups", rank: "Queen", kw: ["同理心", "直觉", "情感智慧"], up: "用你的同理心和情感智慧去理解和帮助他人。", down: "情绪化或过度依赖他人的认可，需要建立情感边界。", sym: "cups_queen" },
    { id: 49, name: "圣杯国王", nameEn: "King of Cups", rank: "King", kw: ["情感成熟", "智慧", "平衡"], up: "用成熟的情感智慧来处理复杂的关系和情况。", down: "情感操控或压抑情绪，需要更真实地表达自己。", sym: "cups_king" },
  ].map(c => ({
    id: c.id, name: c.name, nameEn: c.nameEn,
    namePt: minorName(c.number, c.rank, "cups", RANK_PT, SUIT_PT),
    nameEs: minorName(c.number, c.rank, "cups", RANK_ES, SUIT_ES),
    arcana: "minor" as const, suit: "cups" as const, number: c.number,
    element: "水", wuxing: "水", keywords: c.kw,
    meaningUp: c.up, meaningDown: c.down, symbol: c.sym,
    imageUrl: `/cards/${c.id}.webp`,
  })),

  // ═══ 宝剑 14 张 ═══
  ...[
    { id: 50, name: "宝剑Ace", nameEn: "Ace of Swords", number: 1, rank: "1", kw: ["真相", "清晰", "突破"], up: "用清晰的思维切穿迷雾，真相和突破就在眼前。", down: "思维混乱或用语言伤害他人，需要更谨慎地表达。", sym: "swords_ace" },
    { id: 51, name: "宝剑二", nameEn: "Two of Swords", number: 2, rank: "2", kw: ["僵局", "回避", "选择困难"], up: "面对艰难的选择，你需要摘下眼罩，看清真相。", down: "开始面对你一直回避的问题，做出决定。", sym: "swords_2" },
    { id: 52, name: "宝剑三", nameEn: "Three of Swords", number: 3, rank: "3", kw: ["心碎", "悲伤", "失去"], up: "心痛是真实的，允许自己哀悼，然后慢慢愈合。", down: "从心碎中走出，伤口正在愈合，痛苦在减轻。", sym: "swords_3" },
    { id: 53, name: "宝剑四", nameEn: "Four of Swords", number: 4, rank: "4", kw: ["休息", "恢复", "沉思"], up: "你需要休息和恢复，暂时退出战场是明智之举。", down: "休息已经足够，是时候重新行动了。", sym: "swords_4" },
    { id: 54, name: "宝剑五", nameEn: "Five of Swords", number: 5, rank: "5", kw: ["冲突", "失败", "背叛"], up: "即使赢了，也要思考这场胜利的代价是否值得。", down: "从冲突中走出，学会放下自我，寻求和解。", sym: "swords_5" },
    { id: 55, name: "宝剑六", nameEn: "Six of Swords", number: 6, rank: "6", kw: ["过渡", "离开", "前行"], up: "离开困境，向着更平静的水域前行，未来会更好。", down: "抗拒改变或无法离开困境，需要勇气迈出第一步。", sym: "swords_6" },
    { id: 56, name: "宝剑七", nameEn: "Seven of Swords", number: 7, rank: "7", kw: ["欺骗", "策略", "逃避"], up: "小心周围的欺骗，或审视自己是否在逃避责任。", down: "欺骗被揭穿，或终于决定诚实面对。", sym: "swords_7" },
    { id: 57, name: "宝剑八", nameEn: "Eight of Swords", number: 8, rank: "8", kw: ["束缚", "受害者心态", "自我限制"], up: "你比你想象的更自由，那些束缚大多来自你自己的恐惧。", down: "开始挣脱内心的束缚，重新找回自由。", sym: "swords_8" },
    { id: 58, name: "宝剑九", nameEn: "Nine of Swords", number: 9, rank: "9", kw: ["焦虑", "噩梦", "绝望"], up: "焦虑和恐惧往往比现实更可怕，寻求支持和帮助。", down: "最坏的时期已经过去，焦虑正在减轻。", sym: "swords_9" },
    { id: 59, name: "宝剑十", nameEn: "Ten of Swords", number: 10, rank: "10", kw: ["终结", "背叛", "失败"], up: "这是一个痛苦的结局，但也是新开始的必要前提。", down: "从最低谷中重新站起，只能往上走了。", sym: "swords_10" },
    { id: 60, name: "宝剑侍从", nameEn: "Page of Swords", rank: "Page", kw: ["好奇", "警觉", "直言"], up: "保持警觉和好奇，用敏锐的思维去探索真相。", down: "言语鲁莽或好管闲事，需要三思而后言。", sym: "swords_page" },
    { id: 61, name: "宝剑骑士", nameEn: "Knight of Swords", rank: "Knight", kw: ["行动", "果断", "冲动"], up: "果断行动，用你的智慧和速度去实现目标。", down: "冲动鲁莽或言辞伤人，需要更多的考虑和耐心。", sym: "swords_knight" },
    { id: 62, name: "宝剑王后", nameEn: "Queen of Swords", rank: "Queen", kw: ["独立", "智慧", "直接"], up: "用清晰的思维和直接的方式处理事情，不被情绪左右。", down: "过于冷漠或刻薄，需要在理性中加入一些温情。", sym: "swords_queen" },
    { id: 63, name: "宝剑国王", nameEn: "King of Swords", rank: "King", kw: ["权威", "智慧", "公正"], up: "用你的智慧和公正来做出决定，成为他人的指引。", down: "独断或用权威来压制他人，需要更多的包容。", sym: "swords_king" },
  ].map(c => ({
    id: c.id, name: c.name, nameEn: c.nameEn,
    namePt: minorName(c.number, c.rank, "swords", RANK_PT, SUIT_PT),
    nameEs: minorName(c.number, c.rank, "swords", RANK_ES, SUIT_ES),
    arcana: "minor" as const, suit: "swords" as const, number: c.number,
    element: "风", wuxing: "木", keywords: c.kw,
    meaningUp: c.up, meaningDown: c.down, symbol: c.sym,
    imageUrl: `/cards/${c.id}.webp`,
  })),

  // ═══ 星币 14 张 ═══
  ...[
    { id: 64, name: "星币Ace", nameEn: "Ace of Pentacles", number: 1, rank: "1", kw: ["物质新开始", "机遇", "繁荣"], up: "一个新的物质机遇正在到来，为繁荣和稳定奠定基础。", down: "错失了物质机遇，或过于执着于金钱。", sym: "pentacles_ace" },
    { id: 65, name: "星币二", nameEn: "Two of Pentacles", number: 2, rank: "2", kw: ["平衡", "适应", "灵活"], up: "在多个事务之间保持平衡，灵活应对变化。", down: "失去平衡或过度承担，需要重新分配精力。", sym: "pentacles_2" },
    { id: 66, name: "星币三", nameEn: "Three of Pentacles", number: 3, rank: "3", kw: ["团队合作", "技能", "学习"], up: "团队合作和精益求精是成功的关键，你的技能得到认可。", down: "缺乏团队精神或技能不足，需要更多的学习和合作。", sym: "pentacles_3" },
    { id: 67, name: "星币四", nameEn: "Four of Pentacles", number: 4, rank: "4", kw: ["保守", "稳定", "控制"], up: "保护你的资源是明智的，但不要因此错过了成长的机会。", down: "过于吝啬或控制欲强，需要学会放手和分享。", sym: "pentacles_4" },
    { id: 68, name: "星币五", nameEn: "Five of Pentacles", number: 5, rank: "5", kw: ["贫困", "失去", "困难"], up: "即使在最困难的时候，帮助就在附近，不要放弃。", down: "从困境中走出，物质和精神上的恢复正在发生。", sym: "pentacles_5" },
    { id: 69, name: "星币六", nameEn: "Six of Pentacles", number: 6, rank: "6", kw: ["给予", "接受", "慷慨"], up: "慷慨地给予和接受，财富的流动带来更多的丰盛。", down: "不平等的给予关系，或附加条件的帮助。", sym: "pentacles_6" },
    { id: 70, name: "星币七", nameEn: "Seven of Pentacles", number: 7, rank: "7", kw: ["耐心", "评估", "长期投资"], up: "你的努力正在结出果实，耐心等待，长期投资终有回报。", down: "对进展感到不满，需要重新评估你的策略。", sym: "pentacles_7" },
    { id: 71, name: "星币八", nameEn: "Eight of Pentacles", number: 8, rank: "8", kw: ["勤奋", "技艺", "专注"], up: "专注于磨练你的技能，勤奋和精益求精会带来成功。", down: "过于专注于细节而忽略了大局，或工作过度。", sym: "pentacles_8" },
    { id: 72, name: "星币九", nameEn: "Nine of Pentacles", number: 9, rank: "9", kw: ["独立", "富足", "自给自足"], up: "你已经建立了自己的物质基础，享受这份独立和富足。", down: "过于孤立或物质上的成功掩盖了情感的空虚。", sym: "pentacles_9" },
    { id: 73, name: "星币十", nameEn: "Ten of Pentacles", number: 10, rank: "10", kw: ["财富", "家族", "传承"], up: "物质上的圆满和家族的繁荣，这是长期努力的结晶。", down: "家族矛盾或财富带来的问题，需要重新审视价值观。", sym: "pentacles_10" },
    { id: 74, name: "星币侍从", nameEn: "Page of Pentacles", rank: "Page", kw: ["学习", "实践", "新技能"], up: "带着专注和好奇去学习新技能，踏实的努力会有回报。", down: "缺乏专注或不切实际，需要更多的实际行动。", sym: "pentacles_page" },
    { id: 75, name: "星币骑士", nameEn: "Knight of Pentacles", rank: "Knight", kw: ["勤奋", "可靠", "方法论"], up: "用踏实和可靠的方式去实现目标，一步一个脚印。", down: "过于保守或固执，需要更多的灵活性和创新。", sym: "pentacles_knight" },
    { id: 76, name: "星币王后", nameEn: "Queen of Pentacles", rank: "Queen", kw: ["实际", "滋养", "富足"], up: "用实际和滋养的方式去照顾自己和他人，创造丰盛的生活。", down: "过于物质化或忽略了精神层面的需求。", sym: "pentacles_queen" },
    { id: 77, name: "星币国王", nameEn: "King of Pentacles", rank: "King", kw: ["财富", "商业", "稳定"], up: "你是一个务实的领导者，用你的智慧和资源创造稳定的繁荣。", down: "过于物质化或用金钱来控制他人，需要更多的精神追求。", sym: "pentacles_king" },
  ].map(c => ({
    id: c.id, name: c.name, nameEn: c.nameEn,
    namePt: minorName(c.number, c.rank, "pentacles", RANK_PT, SUIT_PT),
    nameEs: minorName(c.number, c.rank, "pentacles", RANK_ES, SUIT_ES),
    arcana: "minor" as const, suit: "pentacles" as const, number: c.number,
    element: "土", wuxing: "土", keywords: c.kw,
    meaningUp: c.up, meaningDown: c.down, symbol: c.sym,
    imageUrl: `/cards/${c.id}.webp`,
  })),
]

// ─── Lookup helpers ────────────────────────────────────────────────
export function getCardByName(name: string): TarotCardData | undefined {
  return ALL_CARDS.find(c => c.name === name)
}
export function getCardsBySuit(suit: string): TarotCardData[] {
  return ALL_CARDS.filter(c => c.suit === suit)
}
export function getMajorArcana(): TarotCardData[] {
  return ALL_CARDS.filter(c => c.arcana === "major")
}
export function getCardById(id: number): TarotCardData | undefined {
  return ALL_CARDS.find(c => c.id === id)
}
