// ── 梦境解析系统 ──────────────────────────────────────────────────

export interface DreamSymbol {
  keyword: string
  meaning: string
  element: string
  positive: string
  negative: string
}

export interface DreamInterpretation {
  symbols: DreamSymbol[]
  interpretation: string
  subconscious: string
  suggestion: string
  emotion: string
}

// ── 梦境符号词典（100+ 常见梦境符号）────────────────────────────
const DREAM_SYMBOLS: Record<string, DreamSymbol> = {
  // 自然元素
  '水': { keyword: '水', element: '情感', meaning: '情感与潜意识', positive: '情感流动、直觉清晰、净化', negative: '情绪泛滥、迷失方向' },
  '火': { keyword: '火', element: '激情', meaning: '激情与转化', positive: '热情、创造力、净化', negative: '愤怒、破坏、失控' },
  '大海': { keyword: '大海', element: '潜意识', meaning: '深层潜意识与无限可能', positive: '广阔视野、深度探索', negative: '迷失、恐惧未知' },
  '河流': { keyword: '河流', element: '生命', meaning: '生命的流动与方向', positive: '顺势而为、前进', negative: '阻碍、迷失方向' },
  '洪水': { keyword: '洪水', element: '情感', meaning: '情感失控或重大变化', positive: '清洗旧有、重新开始', negative: '情绪淹没、失控' },
  '山': { keyword: '山', element: '挑战', meaning: '挑战与成就', positive: '克服困难、高瞻远瞩', negative: '障碍、压力' },
  '森林': { keyword: '森林', element: '潜意识', meaning: '潜意识的探索', positive: '自然连接、内在智慧', negative: '迷失、恐惧未知' },
  '天空': { keyword: '天空', element: '自由', meaning: '自由与可能性', positive: '无限可能、精神升华', negative: '脱离现实、不切实际' },
  '太阳': { keyword: '太阳', element: '意识', meaning: '意识、活力与成功', positive: '成功、活力、清晰', negative: '过于暴露、自我中心' },
  '月亮': { keyword: '月亮', element: '潜意识', meaning: '潜意识与直觉', positive: '直觉增强、情感深度', negative: '幻觉、情绪波动' },
  '星星': { keyword: '星星', element: '希望', meaning: '希望、指引与梦想', positive: '指引方向、希望', negative: '遥不可及的梦想' },
  '雨': { keyword: '雨', element: '净化', meaning: '净化与更新', positive: '情感释放、净化、新开始', negative: '悲伤、压抑' },
  '雪': { keyword: '雪', element: '纯洁', meaning: '纯洁与新开始', positive: '纯洁、安静、新开始', negative: '冷漠、麻木、孤立' },
  '风': { keyword: '风', element: '变化', meaning: '变化与思维', positive: '变化、新想法、自由', negative: '不稳定、混乱' },
  '闪电': { keyword: '闪电', element: '顿悟', meaning: '突然的顿悟或冲击', positive: '灵感、顿悟、突破', negative: '冲击、破坏' },
  // 动物
  '蛇': { keyword: '蛇', element: '转化', meaning: '转化、智慧与潜在威胁', positive: '蜕变、智慧、疗愈', negative: '背叛、恐惧、危险' },
  '鸟': { keyword: '鸟', element: '自由', meaning: '自由、精神与信息', positive: '自由、精神升华、好消息', negative: '逃避现实' },
  '鱼': { keyword: '鱼', element: '潜意识', meaning: '潜意识的内容与洞见', positive: '丰盛、洞见、潜意识智慧', negative: '情绪困扰' },
  '狗': { keyword: '狗', element: '忠诚', meaning: '忠诚、友谊与本能', positive: '忠诚、友情、保护', negative: '盲目忠诚、本能冲动' },
  '猫': { keyword: '猫', element: '直觉', meaning: '直觉、独立与神秘', positive: '直觉、独立、神秘', negative: '冷漠、不可预测' },
  '老虎': { keyword: '老虎', element: '力量', meaning: '力量、激情与危险', positive: '力量、激情、领导力', negative: '攻击性、危险' },
  '狮子': { keyword: '狮子', element: '权威', meaning: '权威、勇气与自尊', positive: '领导力、勇气、自信', negative: '傲慢、控制欲' },
  '马': { keyword: '马', element: '自由', meaning: '自由、力量与旅程', positive: '自由、力量、前进', negative: '失控、冲动' },
  '蝴蝶': { keyword: '蝴蝶', element: '蜕变', meaning: '蜕变与美丽', positive: '蜕变、美丽、轻盈', negative: '短暂、不稳定' },
  '蜘蛛': { keyword: '蜘蛛', element: '创造', meaning: '创造、命运与恐惧', positive: '创造力、耐心、命运编织', negative: '恐惧、操控、陷阱' },
  // 人物与关系
  '死亡': { keyword: '死亡', element: '转化', meaning: '结束与新开始（通常不是字面意思）', positive: '结束旧有、重生、转化', negative: '恐惧失去、抗拒改变' },
  '婴儿': { keyword: '婴儿', element: '新开始', meaning: '新的开始、潜力与脆弱', positive: '新项目、新关系、潜力', negative: '脆弱、需要照顾' },
  '老人': { keyword: '老人', element: '智慧', meaning: '智慧、经验与内在导师', positive: '智慧、经验、指引', negative: '固执、过时的模式' },
  '陌生人': { keyword: '陌生人', element: '未知', meaning: '未知的自我面向或新的机会', positive: '新机会、未知潜力', negative: '不确定性、恐惧' },
  '父亲': { keyword: '父亲', element: '权威', meaning: '权威、保护与规则', positive: '保护、指导、力量', negative: '控制、评判' },
  '母亲': { keyword: '母亲', element: '滋养', meaning: '滋养、关爱与本能', positive: '关爱、保护、直觉', negative: '过度依赖、控制' },
  // 场所与建筑
  '房子': { keyword: '房子', element: '自我', meaning: '自我与内心状态', positive: '安全感、自我认知', negative: '内心问题、不安全感' },
  '学校': { keyword: '学校', element: '学习', meaning: '学习、成长与评判', positive: '学习机会、成长', negative: '压力、评判恐惧' },
  '医院': { keyword: '医院', element: '疗愈', meaning: '疗愈与关注健康', positive: '疗愈、关注健康', negative: '疾病焦虑、脆弱' },
  '教堂': { keyword: '教堂', element: '精神', meaning: '精神追求与道德', positive: '精神连接、内在平静', negative: '罪恶感、道德压力' },
  '迷宫': { keyword: '迷宫', element: '困惑', meaning: '困惑与寻找出路', positive: '探索、解决问题', negative: '迷失、困惑' },
  // 行为与状态
  '飞翔': { keyword: '飞翔', element: '自由', meaning: '自由、超越与精神升华', positive: '自由、成就、超越限制', negative: '逃避现实' },
  '坠落': { keyword: '坠落', element: '失控', meaning: '失控感或对失败的恐惧', positive: '放手、臣服', negative: '失控、恐惧失败' },
  '追赶': { keyword: '追赶', element: '逃避', meaning: '逃避某事或某人', positive: '面对恐惧的机会', negative: '逃避、压力' },
  '迷路': { keyword: '迷路', element: '方向', meaning: '对人生方向的困惑', positive: '探索新路径', negative: '迷失、不确定' },
  '裸体': { keyword: '裸体', element: '脆弱', meaning: '脆弱感或真实自我', positive: '真实、透明、自由', negative: '脆弱、暴露、羞耻' },
  '考试': { keyword: '考试', element: '评判', meaning: '自我评判或外在压力', positive: '准备充分、自我提升', negative: '压力、自我怀疑' },
  // 物品
  '钥匙': { keyword: '钥匙', element: '机会', meaning: '机会、解决方案与访问权', positive: '机会、解锁潜力', negative: '被锁住、无法进入' },
  '镜子': { keyword: '镜子', element: '自我', meaning: '自我认知与反思', positive: '自我认知、真实', negative: '自我欺骗、扭曲认知' },
  '书': { keyword: '书', element: '知识', meaning: '知识、智慧与记录', positive: '学习、智慧、记录', negative: '信息过载' },
  '金钱': { keyword: '金钱', element: '价值', meaning: '价值观与安全感', positive: '丰盛、安全感、价值', negative: '贪婪、物质执着' },
  '武器': { keyword: '武器', element: '冲突', meaning: '冲突、防御或攻击', positive: '保护自己、设立边界', negative: '攻击性、冲突' },
  '花': { keyword: '花', element: '美丽', meaning: '美丽、爱与短暂', positive: '美丽、爱、绽放', negative: '短暂、脆弱' },
  '树': { keyword: '树', element: '成长', meaning: '成长、根基与生命力', positive: '成长、稳定、生命力', negative: '停滞、根基不稳' },
}

// ── 情绪关键词映射 ────────────────────────────────────────────────
const EMOTION_KEYWORDS: Record<string, string[]> = {
  '平静': ['平静', '安详', '宁静', '放松', '舒适'],
  '喜悦': ['开心', '快乐', '高兴', '喜悦', '兴奋', '幸福'],
  '焦虑': ['焦虑', '紧张', '担心', '害怕', '恐惧', '不安'],
  '悲伤': ['悲伤', '难过', '哭泣', '伤心', '失落', '绝望'],
  '困惑': ['困惑', '迷茫', '不知所措', '混乱', '奇怪'],
}

// ── 提取梦境符号 ──────────────────────────────────────────────────
function extractSymbols(dreamContent: string): DreamSymbol[] {
  const found: DreamSymbol[] = []
  const seen = new Set<string>()

  for (const [keyword, symbol] of Object.entries(DREAM_SYMBOLS)) {
    if (dreamContent.includes(keyword) && !seen.has(keyword)) {
      found.push(symbol)
      seen.add(keyword)
    }
  }

  // 最多返回5个最相关的符号
  return found.slice(0, 5)
}

// ── 检测情绪 ──────────────────────────────────────────────────────
function detectEmotion(dreamContent: string): string {
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    if (keywords.some(k => dreamContent.includes(k))) {
      return emotion
    }
  }
  return '困惑' // 默认
}

// ── 生成梦境解析 ──────────────────────────────────────────────────
export function interpretDream(dreamContent: string): DreamInterpretation {
  const symbols = extractSymbols(dreamContent)
  const emotion = detectEmotion(dreamContent)

  // 基于符号生成解析
  let interpretation = ''
  let subconscious = ''
  let suggestion = ''

  if (symbols.length === 0) {
    // 没有识别到具体符号时，基于情绪生成通用解析
    const emotionInterpretations: Record<string, { interp: string; sub: string; sug: string }> = {
      '平静': {
        interp: '这个梦境呈现出一种内在的平静与和谐。你的潜意识正处于一种平衡的状态，这表明你目前的生活方向是正确的。',
        sub: '你的内心深处感到安全和满足，即使表面上可能还有一些未解决的问题，但你的灵魂知道一切都会好的。',
        sug: '保持这种内在的平静，将它作为面对日常挑战的锚点。'
      },
      '喜悦': {
        interp: '这个梦境充满了积极的能量，你的潜意识正在庆祝某种成就或期待某种美好的事物。',
        sub: '你内心深处有一种对生命的热爱和对未来的期待，这是一种非常珍贵的能量。',
        sug: '让这种喜悦的能量延伸到你的日常生活中，分享你的快乐。'
      },
      '焦虑': {
        interp: '这个梦境反映了你内心的某种压力或未解决的担忧。你的潜意识在试图提醒你关注某个被忽视的问题。',
        sub: '你可能在某个领域感到力不从心，或者对未来有不确定感。这种焦虑是一个信号，提示你需要采取行动。',
        sug: '找出让你最担心的一件事，制定一个具体的应对计划，将不确定性转化为可行的步骤。'
      },
      '悲伤': {
        interp: '这个梦境揭示了你内心深处的某种失落或悲伤。你的潜意识在为某种失去或未竟的心愿哀悼。',
        sub: '你可能正在经历某种形式的失去，或者对过去的某件事仍有未处理的情绪。',
        sug: '允许自己感受这种悲伤，不要压抑它。找一个信任的人倾诉，或者通过写作来释放这些情绪。'
      },
      '困惑': {
        interp: '这个梦境呈现出一种混乱或不确定的状态，你的潜意识正在处理某个复杂的情况或决策。',
        sub: '你可能面临一个重要的选择，或者在某个问题上感到迷失方向。',
        sug: '给自己一些安静的时间，不要急于做决定。让答案自然浮现，信任你的内在智慧。'
      },
    }
    const ei = emotionInterpretations[emotion] || emotionInterpretations['困惑']
    interpretation = ei.interp
    subconscious = ei.sub
    suggestion = ei.sug
  } else {
    // 基于识别到的符号生成解析
    const symbolMeanings = symbols.map(s => s.meaning).join('、')
    const positiveAspects = symbols.map(s => s.positive).filter(Boolean).join('；')
    const negativeAspects = symbols.map(s => s.negative).filter(Boolean).join('；')

    interpretation = `你的梦境包含了${symbols.map(s => s.keyword).join('、')}等重要符号，这些符号分别代表${symbolMeanings}。`

    if (emotion === '平静' || emotion === '喜悦') {
      interpretation += `整体而言，这是一个积极的梦境，暗示${positiveAspects}。`
      subconscious = `你的潜意识正在积极地处理生活中的某些方面，内心深处有一种对${symbols[0]?.element || '成长'}的渴望和准备。`
    } else {
      interpretation += `这个梦境提示你需要关注${negativeAspects}方面的问题，同时也蕴含着${positiveAspects}的潜力。`
      subconscious = `你的潜意识正在提醒你关注某些被压抑的情绪或未解决的问题，特别是与${symbols[0]?.element || '内心'}相关的议题。`
    }

    // 基于主要符号生成建议
    const mainSymbol = symbols[0]
    const suggestionMap: Record<string, string> = {
      '情感': '花时间与自己的情感连接，写日记或与信任的人分享你的感受。',
      '激情': '找到你真正热爱的事情，将这份热情注入到你的日常生活中。',
      '潜意识': '尝试冥想或梦境日记，深入探索你的内在世界。',
      '自由': '检视生活中是否有让你感到束缚的地方，思考如何为自己创造更多自由。',
      '转化': '拥抱当前正在发生的变化，相信每一次蜕变都是成长的机会。',
      '智慧': '信任你的内在智慧，在重要决策前给自己安静思考的时间。',
      '挑战': '将眼前的挑战视为成长的机会，制定具体的行动计划。',
      '学习': '保持开放的心态，寻找学习和成长的机会。',
      '自我': '花时间自我反思，了解你真正想要什么，你真正是谁。',
      '力量': '相信自己的力量，你比你想象的更强大。',
    }
    suggestion = suggestionMap[mainSymbol?.element] || '保持觉察，倾听内心的声音，相信自己的直觉。'
  }

  return { symbols, interpretation, subconscious, suggestion, emotion }
}
