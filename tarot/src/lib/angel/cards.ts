// ── 天使牌数据库（44张）────────────────────────────────────────────
export interface AngelCard {
  id: string
  name: string
  nameEn: string
  element: 'fire' | 'water' | 'earth' | 'air' | 'light'
  color: string
  symbol: string
  affirmation: string
  message: string
  guidance: string
  keywords: string[]
}

export const ANGEL_CARDS: AngelCard[] = [
  // ── 光之天使 ──
  {
    id: 'archangel_michael', name: '大天使米迦勒', nameEn: 'Archangel Michael',
    element: 'fire', color: '#4A90D9', symbol: 'sword_shield',
    affirmation: '我受到神圣力量的保护，无所畏惧。',
    message: '米迦勒天使在你身旁，用他的蓝色火焰之剑斩断一切恐惧与负面能量。你现在是安全的，被完全保护着。',
    guidance: '释放内心的恐惧，相信你有力量面对任何挑战。',
    keywords: ['保护', '勇气', '力量', '清晰']
  },
  {
    id: 'archangel_gabriel', name: '大天使加百列', nameEn: 'Archangel Gabriel',
    element: 'water', color: '#C9954A', symbol: 'trumpet_lily',
    affirmation: '我清晰地表达自己，我的声音有力量。',
    message: '加百列天使带来好消息与新的开始。你的创意表达将为你打开新的大门。',
    guidance: '写作、演讲或艺术创作——用任何方式表达你内心的声音。',
    keywords: ['沟通', '创意', '新开始', '表达']
  },
  {
    id: 'archangel_raphael', name: '大天使拉斐尔', nameEn: 'Archangel Raphael',
    element: 'air', color: '#6BAF8D', symbol: 'healing_staff',
    affirmation: '我的身心灵正在被治愈，我充满健康与活力。',
    message: '拉斐尔天使的翠绿治愈之光正在抚慰你的身心。疗愈正在发生。',
    guidance: '关注你的身体信号，给自己时间休息与恢复。',
    keywords: ['疗愈', '健康', '旅行', '自然']
  },
  {
    id: 'archangel_uriel', name: '大天使乌列尔', nameEn: 'Archangel Uriel',
    element: 'earth', color: '#D4A853', symbol: 'flame_wisdom',
    affirmation: '我拥有解决问题的智慧，答案就在我心中。',
    message: '乌列尔天使以金色智慧之光照亮你前行的道路。你寻找的答案，其实早已在内心深处。',
    guidance: '静下心来冥想，让内在的智慧浮现，相信你的直觉。',
    keywords: ['智慧', '洞察', '解决方案', '直觉']
  },
  {
    id: 'archangel_chamuel', name: '大天使卡麦尔', nameEn: 'Archangel Chamuel',
    element: 'fire', color: '#C87B6E', symbol: 'heart_rose',
    affirmation: '我值得被爱，爱在我的生命中流动。',
    message: '卡麦尔天使用粉红色的爱之光环绕着你。无论你在寻找什么形式的爱，爱的力量正在向你涌来。',
    guidance: '先爱自己，打开心扉，允许爱进入你的生命。',
    keywords: ['爱情', '关系', '自爱', '和谐']
  },
  {
    id: 'archangel_jophiel', name: '大天使约菲尔', nameEn: 'Archangel Jophiel',
    element: 'air', color: '#F5C842', symbol: 'flower_beauty',
    affirmation: '我以美丽的眼光看待世界，我的生命充满美好。',
    message: '约菲尔天使邀请你放慢脚步，欣赏生命中的美丽。当你改变看待事物的角度，你会处处发现礼物。',
    guidance: '整理你的空间，为美丽腾出位置，用感恩的心看待每一天。',
    keywords: ['美丽', '感恩', '创造力', '正念']
  },
  {
    id: 'archangel_zadkiel', name: '大天使扎基尔', nameEn: 'Archangel Zadkiel',
    element: 'water', color: '#7E6FA8', symbol: 'violet_flame',
    affirmation: '我选择宽恕，释放一切怨恨，我自由了。',
    message: '扎基尔天使的紫色火焰正在净化你内心的伤痛。宽恕不是为了别人，而是让你自己从痛苦中解脱。',
    guidance: '写下你想宽恕的人或事，然后将纸烧掉，象征性地释放它。',
    keywords: ['宽恕', '净化', '转化', '自由']
  },
  {
    id: 'archangel_azrael', name: '大天使阿兹拉尔', nameEn: 'Archangel Azrael',
    element: 'earth', color: '#8B7355', symbol: 'lotus_peace',
    affirmation: '我平静地接受生命的每一个阶段，包括告别。',
    message: '阿兹拉尔天使温柔地陪伴着经历失去与转变的你。每一个结束都是新开始的种子。',
    guidance: '允许自己悲伤，同时相信生命的循环会带来新的希望。',
    keywords: ['转变', '失去', '安慰', '过渡']
  },
  // ── 守护天使 ──
  {
    id: 'guardian_abundance', name: '丰盛天使', nameEn: 'Angel of Abundance',
    element: 'earth', color: '#6BAF8D', symbol: 'cornucopia',
    affirmation: '宇宙的丰盛正在向我流动，我接受一切美好。',
    message: '丰盛天使提醒你，宇宙的资源是无限的。匮乏感只是幻觉，真正的丰盛从内心开始。',
    guidance: '每天感恩你已拥有的，观察丰盛如何开始在你生命中显现。',
    keywords: ['丰盛', '财富', '感恩', '显化']
  },
  {
    id: 'guardian_courage', name: '勇气天使', nameEn: 'Angel of Courage',
    element: 'fire', color: '#E8783A', symbol: 'lion_heart',
    affirmation: '我有勇气迈出第一步，我相信自己。',
    message: '勇气天使站在你身边，鼓励你采取那个你一直在推迟的行动。现在就是最好的时刻。',
    guidance: '今天就做那件让你感到害怕但又渴望的事，哪怕只是一小步。',
    keywords: ['勇气', '行动', '突破', '自信']
  },
  {
    id: 'guardian_clarity', name: '清晰天使', nameEn: 'Angel of Clarity',
    element: 'air', color: '#5B7FA6', symbol: 'crystal_prism',
    affirmation: '我的思维清晰，我能看清真相与方向。',
    message: '清晰天使正在驱散你内心的迷雾。困扰你的问题，答案其实比你想象的更简单。',
    guidance: '花10分钟安静地写下你的想法，不加评判，让清晰自然浮现。',
    keywords: ['清晰', '决策', '真相', '专注']
  },
  {
    id: 'guardian_creativity', name: '创造天使', nameEn: 'Angel of Creativity',
    element: 'fire', color: '#C9954A', symbol: 'paintbrush_star',
    affirmation: '我是创造力的渠道，灵感通过我流动。',
    message: '创造天使在你的脑海中点燃灵感之火。你内心有一个独特的创意等待被表达。',
    guidance: '今天拿出纸笔，不带目的地涂鸦或写作，让创意自由流淌。',
    keywords: ['创意', '灵感', '艺术', '表达']
  },
  {
    id: 'guardian_dreams', name: '梦想天使', nameEn: 'Angel of Dreams',
    element: 'water', color: '#7E6FA8', symbol: 'moon_stars',
    affirmation: '我的梦想是真实的，宇宙正在帮助我实现它。',
    message: '梦想天使提醒你，那些深藏心底的渴望不是幻想，而是灵魂的指引。',
    guidance: '写下你最深的梦想，不要问"怎么可能"，只问"如果可能，我会怎么做"。',
    keywords: ['梦想', '愿景', '显化', '可能性']
  },
  {
    id: 'guardian_faith', name: '信念天使', nameEn: 'Angel of Faith',
    element: 'light', color: '#F5ECD8', symbol: 'anchor_light',
    affirmation: '我信任生命的过程，一切都在完美地展开。',
    message: '信念天使提醒你，即使看不见前方的路，也要相信脚下的每一步都有意义。',
    guidance: '放下对结果的执着，专注于此刻你能做的，相信其余的会自然到来。',
    keywords: ['信念', '信任', '放手', '神圣计划']
  },
  {
    id: 'guardian_grace', name: '恩典天使', nameEn: 'Angel of Grace',
    element: 'light', color: '#F0EDF8', symbol: 'dove_light',
    affirmation: '我以优雅和感恩接受生命中的一切。',
    message: '恩典天使提醒你，生命中的每一个经历，无论顺逆，都是灵魂成长的礼物。',
    guidance: '今天找出三件你通常会抱怨的事，试着从中发现隐藏的礼物。',
    keywords: ['感恩', '优雅', '接受', '礼物']
  },
  {
    id: 'guardian_harmony', name: '和谐天使', nameEn: 'Angel of Harmony',
    element: 'earth', color: '#6BAF8D', symbol: 'yin_yang_flower',
    affirmation: '我的内心平静，我与周围的一切和谐共存。',
    message: '和谐天使提醒你，当内心平静时，外在的冲突也会自然化解。',
    guidance: '今天避免争论，用倾听代替辩解，感受和谐的力量。',
    keywords: ['和谐', '平衡', '和平', '关系']
  },
  {
    id: 'guardian_healing', name: '疗愈天使', nameEn: 'Angel of Healing',
    element: 'water', color: '#6BAF8D', symbol: 'healing_hands',
    affirmation: '我的身体有自我疗愈的能力，我现在正在康复。',
    message: '疗愈天使将温暖的绿色光芒注入你的身体和心灵。',
    guidance: '今天给自己一个疗愈的仪式：泡澡、冥想、或在自然中散步。',
    keywords: ['疗愈', '健康', '恢复', '自我关爱']
  },
  {
    id: 'guardian_hope', name: '希望天使', nameEn: 'Angel of Hope',
    element: 'light', color: '#F5C842', symbol: 'sunrise_bird',
    affirmation: '即使在黑暗中，我也能看见希望的光芒。',
    message: '希望天使在你最黑暗的时刻点亮一盏灯。黎明之前总是最黑暗的，转机即将到来。',
    guidance: '回想一次你以为过不去但最终过去了的困境，让它成为你现在的力量。',
    keywords: ['希望', '乐观', '转机', '坚持']
  },
  {
    id: 'guardian_intuition', name: '直觉天使', nameEn: 'Angel of Intuition',
    element: 'water', color: '#7E6FA8', symbol: 'third_eye',
    affirmation: '我信任我的直觉，它是宇宙对我说话的方式。',
    message: '直觉天使提醒你，那个微弱的内心声音比任何外在建议都更了解你。学会倾听它。',
    guidance: '今天做一个决定时，先问问你的身体感受，而不是只用头脑思考。',
    keywords: ['直觉', '内在声音', '第六感', '洞察']
  },
  {
    id: 'guardian_joy', name: '喜悦天使', nameEn: 'Angel of Joy',
    element: 'fire', color: '#F5C842', symbol: 'sunflower_dance',
    affirmation: '我允许自己感到喜悦，快乐是我的天赋权利。',
    message: '喜悦天使提醒你，快乐不需要理由，也不需要等待某个条件达成。你现在就可以选择它。',
    guidance: '今天做一件纯粹让你开心的事，不需要任何理由。',
    keywords: ['喜悦', '快乐', '轻盈', '玩耍']
  },
  {
    id: 'guardian_love', name: '爱之天使', nameEn: 'Angel of Love',
    element: 'water', color: '#C87B6E', symbol: 'rose_heart',
    affirmation: '我是爱，我被爱，爱在我生命中无处不在。',
    message: '爱之天使提醒你，你本身就是爱的化身。当散发爱的能量时，爱自然会以各种形式回到你身边。',
    guidance: '今天对镜子里的自己说三句爱的话，感受自爱的力量。',
    keywords: ['爱', '自爱', '吸引力', '连接']
  },
  {
    id: 'guardian_manifestation', name: '显化天使', nameEn: 'Angel of Manifestation',
    element: 'earth', color: '#C9954A', symbol: 'golden_spiral',
    affirmation: '我的想法和意图正在成为现实，我是强大的创造者。',
    message: '显化天使告诉你，你的愿望已经被宇宙听见。现在是将能量专注于你真正想要的事物上的时候。',
    guidance: '写下最重要的一个愿望，每天花5分钟想象它已经实现的感觉。',
    keywords: ['显化', '意图', '创造', '愿望']
  },
  {
    id: 'guardian_nature', name: '自然天使', nameEn: 'Angel of Nature',
    element: 'earth', color: '#6BAF8D', symbol: 'tree_earth',
    affirmation: '我与大地相连，自然的力量滋养着我。',
    message: '自然天使邀请你回归大地的怀抱。自然是最古老也最有效的疗愈师。',
    guidance: '今天去户外走走，赤脚踩在草地上，感受大地的能量。',
    keywords: ['自然', '大地', '接地', '疗愈']
  },
  {
    id: 'guardian_patience', name: '耐心天使', nameEn: 'Angel of Patience',
    element: 'earth', color: '#8B7355', symbol: 'hourglass_flower',
    affirmation: '我以平静的心等待，一切都在完美的时机发生。',
    message: '耐心天使提醒你，种子在土壤中需要时间发芽。一切都在以完美的节奏向你靠近。',
    guidance: '当你感到不耐烦时，深呼吸三次，问自己：如果我相信一切都会好，我现在会怎么做？',
    keywords: ['耐心', '等待', '时机', '信任']
  },
  {
    id: 'guardian_peace', name: '平静天使', nameEn: 'Angel of Peace',
    element: 'water', color: '#5B7FA6', symbol: 'still_water',
    affirmation: '我内心平静如镜，任何风浪都无法真正扰动我。',
    message: '平静天使将宁静的蓝色光芒注入你的心灵。内心深处永远有一片宁静的圣地。',
    guidance: '今天花10分钟静坐，只是观察自己的呼吸，不做任何评判。',
    keywords: ['平静', '宁静', '冥想', '内在安宁']
  },
  {
    id: 'guardian_power', name: '力量天使', nameEn: 'Angel of Power',
    element: 'fire', color: '#E8783A', symbol: 'phoenix_flame',
    affirmation: '我拥有改变自己生命的力量，我是自己命运的主人。',
    message: '力量天使提醒你，你比你想象的更强大。那些困境都是在锻造你的力量。',
    guidance: '回顾你克服过的最大挑战，感受那份力量，它现在依然在你身上。',
    keywords: ['力量', '韧性', '自主', '赋权']
  },
  {
    id: 'guardian_prosperity', name: '繁荣天使', nameEn: 'Angel of Prosperity',
    element: 'earth', color: '#D4A853', symbol: 'golden_coins',
    affirmation: '繁荣以各种形式流向我，我值得拥有美好的生活。',
    message: '繁荣天使提醒你，繁荣不仅仅是金钱，还包括健康、关系、时间和快乐。',
    guidance: '列出你生命中10件非金钱的财富，感受真正的繁荣。',
    keywords: ['繁荣', '富足', '价值', '成功']
  },
  {
    id: 'guardian_protection', name: '守护天使', nameEn: 'Angel of Protection',
    element: 'fire', color: '#4A90D9', symbol: 'shield_wings',
    affirmation: '我被神圣之光保护，任何负面能量都无法伤害我。',
    message: '守护天使用白色光芒的盾牌环绕着你。你是安全的，被保护的。',
    guidance: '每天早晨想象一道白色光芒的防护罩包围你的全身，设定今天的能量边界。',
    keywords: ['保护', '安全', '边界', '防护']
  },
  {
    id: 'guardian_purpose', name: '使命天使', nameEn: 'Angel of Purpose',
    element: 'light', color: '#C9954A', symbol: 'north_star',
    affirmation: '我知道我的使命，我的存在有深刻的意义。',
    message: '使命天使提醒你，你来到这个世界不是偶然的。你有独特的天赋和使命。',
    guidance: '问自己：如果不担心失败和他人的看法，我最想做什么？那就是你的使命方向。',
    keywords: ['使命', '目的', '天赋', '意义']
  },
  {
    id: 'guardian_release', name: '释放天使', nameEn: 'Angel of Release',
    element: 'air', color: '#9B8E82', symbol: 'butterfly_free',
    affirmation: '我轻松地释放一切不再服务于我的事物。',
    message: '释放天使提醒你，是时候放下那些占据你能量的旧模式、旧关系或旧信念了。',
    guidance: '写下三件你想释放的事，然后将纸撕碎，象征性地让它们离开你的生命。',
    keywords: ['释放', '放手', '转化', '自由']
  },
  {
    id: 'guardian_renewal', name: '更新天使', nameEn: 'Angel of Renewal',
    element: 'water', color: '#5B7FA6', symbol: 'spring_blossom',
    affirmation: '我每天都在更新和成长，生命充满新的可能。',
    message: '更新天使带来春天的能量，提醒你每一天都是全新的开始。',
    guidance: '今天做一件你从未做过的小事，感受新鲜感和活力。',
    keywords: ['更新', '重生', '新开始', '成长']
  },
  {
    id: 'guardian_serenity', name: '宁静天使', nameEn: 'Angel of Serenity',
    element: 'water', color: '#7E9BAF', symbol: 'calm_lake',
    affirmation: '我选择宁静，我的心是平静的湖面。',
    message: '宁静天使提醒你，真正的平静不是没有风浪，而是在风浪中保持内心的稳定。',
    guidance: '今天遇到任何让你烦躁的事，先停下来，问自己：五年后这件事还重要吗？',
    keywords: ['宁静', '平静', '稳定', '内在力量']
  },
  {
    id: 'guardian_strength', name: '坚韧天使', nameEn: 'Angel of Strength',
    element: 'earth', color: '#8B7355', symbol: 'mountain_oak',
    affirmation: '我像大山一样坚定，我有足够的力量面对一切。',
    message: '坚韧天使提醒你，你已经经历过许多困难并走了过来。这些经历是你力量的证明。',
    guidance: '今天当你感到疲惫时，想想你曾经克服过的最大挑战。',
    keywords: ['坚韧', '毅力', '稳定', '根基']
  },
  {
    id: 'guardian_surrender', name: '臣服天使', nameEn: 'Angel of Surrender',
    element: 'water', color: '#C87B6E', symbol: 'open_hands',
    affirmation: '我放下控制，信任宇宙的安排，一切都会好的。',
    message: '臣服天使提醒你，有些事情不是你能控制的，而这正是好事。学会放手。',
    guidance: '今天找出一件你一直试图控制却徒劳无功的事，有意识地放手。',
    keywords: ['臣服', '放手', '信任', '流动']
  },
  {
    id: 'guardian_transformation', name: '蜕变天使', nameEn: 'Angel of Transformation',
    element: 'fire', color: '#7E6FA8', symbol: 'butterfly_fire',
    affirmation: '我欢迎改变，每一次蜕变都让我更接近真实的自己。',
    message: '蜕变天使告诉你，你正在经历一次深刻的内在转化。就像毛毛虫在茧中蜕变。',
    guidance: '拥抱当前的不确定性，问自己：这次改变在召唤我成为更好的什么版本？',
    keywords: ['蜕变', '转化', '成长', '蝴蝶效应']
  },
  {
    id: 'guardian_truth', name: '真理天使', nameEn: 'Angel of Truth',
    element: 'air', color: '#5B7FA6', symbol: 'mirror_light',
    affirmation: '我勇敢地活出自己的真实，我的真相有力量。',
    message: '真理天使提醒你，是时候对自己诚实了。那些逃避的真相，其实是通往自由的钥匙。',
    guidance: '今天问自己一个一直不敢面对的问题，诚实地回答它。',
    keywords: ['真理', '诚实', '真实', '自由']
  },
  {
    id: 'guardian_wisdom', name: '智慧天使', nameEn: 'Angel of Wisdom',
    element: 'light', color: '#D4A853', symbol: 'owl_scroll',
    affirmation: '我拥有古老的智慧，我知道我需要知道的一切。',
    message: '智慧天使提醒你，你所寻找的答案不在外面，而在你内心深处的智慧中。',
    guidance: '今天在做重要决定前，先花5分钟冥想，让内在的智慧浮现。',
    keywords: ['智慧', '洞见', '内在知识', '觉知']
  },
  {
    id: 'guardian_wonder', name: '奇迹天使', nameEn: 'Angel of Wonder',
    element: 'light', color: '#F5C842', symbol: 'star_child',
    affirmation: '我以孩子般的好奇心看待世界，奇迹无处不在。',
    message: '奇迹天使提醒你，当你以惊奇的眼光看待生命时，奇迹就会开始发生。',
    guidance: '今天找出一件习以为常的事，重新以第一次见到它的眼光去欣赏它。',
    keywords: ['奇迹', '惊奇', '好奇心', '魔法']
  },
  // ── 元素天使 ──
  {
    id: 'elemental_fire', name: '火焰天使', nameEn: 'Fire Angel',
    element: 'fire', color: '#E8783A', symbol: 'fire_wings',
    affirmation: '我内心的热情之火熊熊燃烧，点燃我的生命。',
    message: '火焰天使带来激情、行动和转化的能量。现在是采取大胆行动的时候。',
    guidance: '今天做一件需要勇气和热情的事，感受火的力量在你体内燃烧。',
    keywords: ['激情', '行动', '热情', '转化']
  },
  {
    id: 'elemental_water', name: '水流天使', nameEn: 'Water Angel',
    element: 'water', color: '#5B7FA6', symbol: 'water_flow',
    affirmation: '我像水一样流动，柔软而有力量。',
    message: '水流天使带来情感、直觉和流动的能量。是时候让自己的情感自然流动。',
    guidance: '今天允许自己感受所有的情绪，不评判，只是观察它们如何流过你。',
    keywords: ['情感', '流动', '直觉', '柔软']
  },
  {
    id: 'elemental_earth', name: '大地天使', nameEn: 'Earth Angel',
    element: 'earth', color: '#6BAF8D', symbol: 'earth_roots',
    affirmation: '我扎根于大地，稳定而有力量。',
    message: '大地天使带来稳定、实际和繁荣的能量。是时候将你的梦想落地。',
    guidance: '今天为你的一个重要目标制定一个具体可行的行动计划。',
    keywords: ['稳定', '实际', '落地', '繁荣']
  },
  {
    id: 'elemental_air', name: '风之天使', nameEn: 'Air Angel',
    element: 'air', color: '#9B8E82', symbol: 'wind_feather',
    affirmation: '我的思维自由清晰，新的想法在我心中翱翔。',
    message: '风之天使带来思维、沟通和变化的能量。是时候打开你的思维，接受新的观点和可能性。',
    guidance: '今天与一个和你想法不同的人交谈，真诚地倾听他们的观点。',
    keywords: ['思维', '沟通', '变化', '自由']
  },
  {
    id: 'elemental_light', name: '光之天使', nameEn: 'Light Angel',
    element: 'light', color: '#F5F0E8', symbol: 'pure_light',
    affirmation: '我是光，我散发光，我吸引光。',
    message: '光之天使提醒你，你本质上是一道光。活出真实的样子时，就在为这世界带来光明。',
    guidance: '今天做一件让你感到"这就是真实的我"的事，让你的光芒自然闪耀。',
    keywords: ['光明', '真实', '本质', '神圣']
  },
]

export function drawAngelCard(seed?: string): AngelCard {
  const now = new Date()
  const seedStr = seed || `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
  let hash = 0
  for (let i = 0; i < seedStr.length; i++) {
    const char = seedStr.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const index = Math.abs(hash) % ANGEL_CARDS.length
  return ANGEL_CARDS[index]
}

export function recommendAngelCard(intention: string): AngelCard {
  const keywords: Record<string, string[]> = {
    love: ['爱', '感情', '关系', '恋爱', '婚姻', '伴侣'],
    work: ['工作', '事业', '职场', '升职', '创业'],
    health: ['健康', '身体', '疾病', '康复', '疗愈'],
    money: ['钱', '财富', '收入', '投资', '财务'],
    growth: ['成长', '学习', '提升', '改变', '突破'],
  }
  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(w => intention.includes(w))) {
      const categoryCards: Record<string, string[]> = {
        love: ['guardian_love', 'archangel_chamuel', 'guardian_harmony'],
        work: ['guardian_purpose', 'guardian_courage', 'guardian_manifestation'],
        health: ['archangel_raphael', 'guardian_healing', 'guardian_renewal'],
        money: ['guardian_abundance', 'guardian_prosperity', 'elemental_earth'],
        growth: ['guardian_transformation', 'guardian_wisdom', 'guardian_strength'],
      }
      const ids = categoryCards[category]
      const card = ANGEL_CARDS.find(c => ids.includes(c.id))
      if (card) return card
    }
  }
  return drawAngelCard(intention)
}
