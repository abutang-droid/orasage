/**
 * SATYA 五层 PDP 内容模板 — 全站商品详情页统一风格
 * 供 seed-shop-product-pages-all.ts 调用
 */

export type ProductRow = {
  sku: string;
  name: string;
  element?: string | null;
  desc?: string;
  description?: string;
  category: 'crystal' | 'report' | 'service';
  requiresShipping?: boolean;
  active?: boolean;
};

export type GeneratedPage = {
  subtitle: string;
  seoTitle: string;
  seoDescription: string;
  galleryVideoUrl?: string;
  sceneVideoUrl?: string;
  sections: Array<Record<string, unknown>>;
  testimonials: Array<{ author: string; rating: number; body: string; sort: number }>;
};

const MANIFEST_WEAR = '佩戴显化 · Wear to Manifest';
const MANIFEST_READ = '解读显化 · Read to Manifest';
const MANIFEST_ACT = '行动显化 · Act to Manifest';

type CrystalConfig = {
  subtitle: string;
  stoneEn: string;
  stoneZh: string;
  element: string;
  elementTrait: string;
  storyTitle: string;
  storyBody: string;
  manifestEn: string;
  manifestZh: string;
  guideTitle: string;
  guideBody: string;
  pairingIntro: string;
  pairings: Array<{ combo: string; effect: string }>;
  promiseNote: string;
  testimonials: Array<{ author: string; body: string }>;
};

const CRYSTAL_SATYA: Record<string, CrystalConfig> = {
  'crystal-wood': {
    subtitle: 'Growth Realm Green Phantom Bracelet',
    stoneEn: 'Green Phantom Quartz',
    stoneZh: '绿幽灵',
    element: '木',
    elementTrait: '木主生长、主拓展、主生机。适合希望「打开局面」「增添活力」「让事业与生活向上生长」的阶段。',
    storyTitle: '绿幽灵的灵性图谱',
    storyBody: `在水晶疗愈传统中，绿幽灵被称为「财富之石」——并非指一夜暴富，而是象征生长中的丰盛：像一棵正在抽芽的树，根系稳固，枝叶向光。

巴西矿区的绿幽灵常带有层叠的「幽灵」纹理，那是水晶在形成过程中多次生长留下的年轮，被视作时间沉淀的智慧。

东方五行中，木行对应春、东方、肝胆与决策的「开始」。绿幽灵的能量温和而持续，适合需要耐心积累、而非急躁冲刺的人。

这不是炫耀的财富符号。这是一颗正在生长的种子。`,
    manifestEn: `I grow with patience. I welcome abundance.
My path unfolds like spring — steady, green, alive.`,
    manifestZh: `我耐心生长，迎接丰盛。
我的路如春天般展开——稳健、青翠、充满生机。`,
    guideTitle: '何时佩戴绿幽灵',
    guideBody: `🌱 新项目启动前 → 给自己一点「开始」的仪式感
💼 求职 / 面试 → 保持开放与自信
🌿 感到停滞时 → 提醒自己：生长需要时间
🧘 晨间冥想 → 观想绿意从心底蔓延
🌙 睡前 → 放下对结果的焦虑，信任过程`,
    pairingIntro: '绿幽灵（生长）+ 其他水晶 = 定向放大',
    pairings: [
      { combo: '绿幽灵 + 白水晶', effect: '看清方向再行动，生长不盲目' },
      { combo: '绿幽灵 + 黄水晶', effect: '既有愿景也有落地执行的稳' },
      { combo: '绿幽灵 + 黑曜石', effect: '拓展时保持边界，不被消耗' },
    ],
    promiseNote: '每颗绿幽灵均保留天然雾状包裹体与层理——那是时间写下的生长印记',
    testimonials: [
      { author: '林**', body: '创业第一年戴着它，不是为了招财，是提醒自己别急。绿幽灵里的纹理像年轮，看着心就稳。' },
      { author: '周**', body: '八字补木推荐这款。名字「生长之境」很贴切——每次抬腕看见它，就想起：事情正在长，不用慌。' },
      { author: '王**', body: '珠子比图片更有层次，幽灵纹理每颗不同。搭配正装也不突兀，低调但有故事。' },
    ],
  },
  'crystal-fire': {
    subtitle: 'Flame Heart Carnelian Bracelet',
    stoneEn: 'Carnelian',
    stoneZh: '红玛瑙',
    element: '火',
    elementTrait: '火主热情、主行动、主表达。适合需要「鼓起勇气」「走出舒适区」「让内在动力重新燃烧」的时刻。',
    storyTitle: '红玛瑙的灵性图谱',
    storyBody: `古埃及人将红玛瑙献给战神与太阳神，相信它能赋予佩戴者勇气与生命力。罗马战士常在盔甲上镶嵌红玛瑙，作为护身与提振士气的信物。

在脉轮体系中，红玛瑙连接脐轮与心轮之间——那是「想要」与「敢做」的桥梁。它的色泽来自铁元素氧化，温暖而不刺眼，像黄昏时分仍有余温的炭火。

五行火行对应夏、南方、心与表达。红玛瑙不制造躁动的亢奋，而是点燃可持续的行动力。

这不是张扬的装饰。这是一簇可靠的火苗。`,
    manifestEn: `I act with courage. I speak my truth.
My fire warms others without burning out.`,
    manifestZh: `我勇敢行动，说出真实。
我的火温暖他人，却不灼伤自己。`,
    guideTitle: '何时佩戴红玛瑙',
    guideBody: `🔥 重要演讲 / 汇报前 → 提振表达气场
💪 需要突破拖延时 → 点燃行动的第一步
❤️ 社交场合 → 保持开放与亲和力
🏃 运动 / 健身 → 增强耐力与专注
🌙 睡前取下 → 让身心在夜间恢复平静`,
    pairingIntro: '红玛瑙（行动）+ 其他水晶 = 定向放大',
    pairings: [
      { combo: '红玛瑙 + 白水晶', effect: '热情有方向，行动不盲目' },
      { combo: '红玛瑙 + 黑曜石', effect: '勇敢前行同时守住边界' },
      { combo: '红玛瑙 + 绿幽灵', effect: '既有行动力也有生长的耐心' },
    ],
    promiseNote: '每颗红玛瑙保留天然色差与玛瑙纹——色泽深浅不一是大地的签名',
    testimonials: [
      { author: '陈**', body: '汇报前戴着心里踏实很多，红色不艳俗，是那种让人想站直了说话的颜色。' },
      { author: '张**', body: '补火用的。以前总拖延，现在抬手看见它就想起：先做第一步。' },
      { author: '李**', body: '质感温润，比想象中轻。日常通勤戴，同事问了好几次链接。' },
    ],
  },
  'crystal-earth': {
    subtitle: 'Grounded Root Citrine Bracelet',
    stoneEn: 'Citrine',
    stoneZh: '黄水晶',
    element: '土',
    elementTrait: '土主稳定、主承载、主聚财。适合需要「脚踏实地」「守住成果」「在变动中保持内心安稳」的阶段。',
    storyTitle: '黄水晶的灵性图谱',
    storyBody: `黄水晶在商业世界中被称为「商人之石」，但古老的智慧更强调它的「土行」本质：不是投机，而是耕耘后的收获。

苏格兰与巴西的黄水晶矿脉，晶体常呈温暖的蜜金色，像被阳光浸透的琥珀。天然黄水晶（非加热紫水晶）尤为珍贵，其色泽来自微量铁与辐射成因。

在五行中，土行对应长夏、中央、脾胃与信任。黄水晶提醒佩戴者：真正的丰盛来自日复一日的积累，而非一夜之间的侥幸。

这不是炫耀的财富符号。这是一块踏实的大地。`,
    manifestEn: `I build steadily. I trust the harvest.
My roots go deep; my fruits come in time.`,
    manifestZh: `我稳步建设，信任收获。
我的根扎得深，果实会在对的时节到来。`,
    guideTitle: '何时佩戴黄水晶',
    guideBody: `💰 财务规划 / 记账时 → 提醒自己务实与耐心
📋 项目收尾阶段 → 守住成果、查漏补缺
🏠 感到漂泊不安时 → 观想脚下有根
🧘 午后倦怠 → 温和的蜜金色提振心神
🌙 睡前 → 放下对「不够」的焦虑`,
    pairingIntro: '黄水晶（稳固）+ 其他水晶 = 定向放大',
    pairings: [
      { combo: '黄水晶 + 白水晶', effect: '务实判断，不被欲望牵着走' },
      { combo: '黄水晶 + 绿幽灵', effect: '既有愿景也有落地的耐心' },
      { combo: '黄水晶 + 黑曜石', effect: '聚财时守住能量边界' },
    ],
    promiseNote: '每颗黄水晶保留天然色带与冰裂——天然蜜金而非人工染色',
    testimonials: [
      { author: '赵**', body: '土行水晶里最喜欢这款，颜色像蜂蜜。戴着它做财务规划，心没那么浮躁。' },
      { author: '吴**', body: '八字说土弱，顾问推荐。名字「厚土之根」很戳——提醒自己别飘，先把脚下踩实。' },
      { author: '郑**', body: '光泽温润，阳光下特别好看。弹力绳结实，戴了一个月没有松。' },
    ],
  },
  'crystal-metal': {
    subtitle: 'Clarity Unveiled Clear Quartz Bracelet',
    stoneEn: 'Clear Quartz',
    stoneZh: '白水晶',
    element: '金',
    elementTrait: '金主收敛、主清晰、主边界。适合需要「看清方向」「做重要决定」「整理思绪」的人生阶段。',
    storyTitle: '白水晶的灵性图谱',
    storyBody: `几乎每一种古老传统中，透明水晶都占据着特殊的位置。

在喜马拉雅修行传统中，白水晶被视为「冻结的光」，认为它捕捉了第一缕阳光的纯粹能量。西藏僧侣用它来触碰脉轮、标记冥想空间的神圣边界。

古希腊人相信白水晶是「来自冰神的神赐礼物」，Plato 在《蒂迈欧篇》中将其描述为一种「穿透物质世界、直达理念世界的透明介质」。

北美原住民的萨满用白水晶来做「看见」——他们相信晶体能放大内在视觉，让人看到隐藏在表象之下的事物真相。

现代能量疗愈师称其为万能放大器（amplifier），因为它不带有特定色彩偏频，而是均匀地放大你放入其中的任何意图。

这不是装饰品。这是一扇窗。`,
    manifestEn: `I think clearly. I see through illusions.
My mind is a still lake, reflecting truth.`,
    manifestZh: `我想得清楚。我看透幻象。
我的心是一面宁静的湖，映照真相。`,
    guideTitle: '何时佩戴白水晶',
    guideBody: `🌅 重要决策前 → 让直觉穿过噪音
📚 学习 / 考试 → 增强专注与记忆
🧘 冥想 / 静心 → 加深进入安静的速度
💼 重要会议 / 谈判 → 保持清醒不被情绪带走
🌙 睡前 → 清理一天积累的思维碎片`,
    pairingIntro: '白水晶（放大器）+ 任何其他水晶 = 效果 ×2',
    pairings: [
      { combo: '白水晶 + 黑曜石', effect: '保护力强 + 保持清醒头脑' },
      { combo: '白水晶 + 粉水晶', effect: '清晰地感知爱（而不是盲目陷入）' },
      { combo: '白水晶 + 黄水晶', effect: '既看准机会又保持理性判断' },
    ],
    promiseNote: '每颗白水晶均经手工筛选，保持天然冰裂纹理与内含物——那是地球的指纹',
    testimonials: [
      { author: '林**', body: '戴上之后开会脑子清楚多了，不像以前那么容易被人带节奏。珠子很通透，像把杂念滤掉了一层。' },
      { author: '周**', body: '八字说缺金，顾问推荐这款。名字「澄明之境」很戳我——每次抬手看见它，就会提醒自己：想清楚再说话。' },
      { author: '陈**', body: '肯定语卡片我截图设成壁纸了。备考那段时间每天戴着，心没那么慌，专注力确实稳了一些。' },
    ],
  },
  'crystal-water': {
    subtitle: 'Deep Still Obsidian Bracelet',
    stoneEn: 'Obsidian',
    stoneZh: '黑曜石',
    element: '水',
    elementTrait: '水主流动、主防护、主净化。适合需要「建立边界」「吸收负能量」「在敏感环境中保持内在稳定」的阶段。',
    storyTitle: '黑曜石的灵性图谱',
    storyBody: `黑曜石是火山熔岩急速冷却形成的天然玻璃，古人将它视作「大地之泪」凝固后的形态——深邃、锋利、却充满保护力。

阿兹特克与玛雅文明用黑曜石制作镜子与仪式工具，相信它能映照真相，包括那些我们不愿面对的阴影。现代心理学称之为「阴影工作」的入门石。

在五行中，水行对应冬、北方、肾与直觉。黑曜石不是让人变得冷漠，而是教人分辨：哪些能量属于自己，哪些需要归还。

这不是攻击性的武器。这是一面沉默的盾。`,
    manifestEn: `I am protected. I release what is not mine.
My depth holds wisdom; my boundaries hold peace.`,
    manifestZh: `我受到保护。我放下不属于我的。
我的深处有智慧；我的边界带来安宁。`,
    guideTitle: '何时佩戴黑曜石',
    guideBody: `🛡️ 进入嘈杂 / 负能量环境前 → 建立心理边界
🌙 感到情绪沉重时 → 观想黑色吸纳杂质后净化
✈️ 差旅 / 陌生场合 → 保持内在稳定
🧘 深度冥想 → 面对内在阴影，不逃避
☀️ 避免长时间暴晒 → 天然玻璃需温和对待`,
    pairingIntro: '黑曜石（防护）+ 其他水晶 = 定向放大',
    pairings: [
      { combo: '黑曜石 + 白水晶', effect: '防护同时保持头脑清醒' },
      { combo: '黑曜石 + 红玛瑙', effect: '勇敢表达但不失边界' },
      { combo: '黑曜石 + 黄水晶', effect: '守财守能，不被消耗' },
    ],
    promiseNote: '每颗黑曜石保留天然彩虹眼或纹理——火山馈赠的独特光晕',
    testimonials: [
      { author: '孙**', body: '敏感体质，去医院或人多的地方会戴着。不是玄学，是一种「我有边界」的心理暗示，很管用。' },
      { author: '王**', body: '水行补能。黑得很正，光泽好。睡前会取下，白天通勤戴，心里踏实。' },
      { author: '李**', body: '比想象中有分量，质感像打磨过的火山玻璃。包装用心，附赠的指南卡片写得很清楚。' },
    ],
  },
};

const CRYSTAL_NAMES: Record<string, string> = {
  'crystal-wood': '生长之境 · 绿幽灵能量手串',
  'crystal-fire': '焰心觉醒 · 红玛瑙能量手串',
  'crystal-earth': '厚土之根 · 黄水晶能量手串',
  'crystal-metal': '澄明之境 · 白水晶能量手串',
  'crystal-water': '深海静盾 · 黑曜石能量手串',
};

function crystalEnergyBlock(cfg: CrystalConfig): string {
  return `✦ ${cfg.stoneEn} — ${cfg.stoneZh}

${cfg.stoneZh}的能量特质：
• 与五行${cfg.element}行共振，调和对应能量场
• 天然石料，每颗珠子独一无二
• 适合日常佩戴，作为意图提醒的物理锚点

✦ 五行属性 — ${cfg.element}

${cfg.elementTrait}

✦ 规格

• 天然${cfg.stoneZh}珠，直径约 8mm
• 弹力绳穿制，适配 15–19cm 手围
• 每颗珠子因天然形成而独一无二`;
}

function crystalStoryBlock(cfg: CrystalConfig): string {
  return `── ${cfg.storyTitle} ──

${cfg.storyBody}`;
}

function crystalPairingBlock(cfg: CrystalConfig): string {
  const lines = cfg.pairings.map((p) => `• ${p.combo} → ${p.effect}`).join('\n');
  return `── 能量搭配推荐 ──

${cfg.pairingIntro}

${lines}`;
}

function crystalPromiseItems(cfg: CrystalConfig) {
  return [
    { label: '天然石料', value: cfg.promiseNote },
    { label: '手工穿制', value: '由经验丰富的工匠逐颗穿制，弹力绳选用日本进口水晶线，耐用且亲肤' },
    { label: '能量预处理', value: '每条手串出货前经过简单净化仪式（月光照射 + 鼠尾草烟熏）' },
    { label: '附赠', value: '绒布收纳袋 × 1 + 能量使用指南卡片 × 1' },
  ];
}

function crystalFaq() {
  return [
    { question: '如何选手围？', answer: '结账时选择手围尺码；若介于两档之间，建议选大一号，佩戴更舒适。' },
    { question: '水晶需要消磁吗？', answer: '收到后可用清水轻冲、阴干即可。若感觉能量沉闷，可放在月光下静置一晚。' },
    { question: '可以和其他水晶一起戴吗？', answer: '可以。可参考能量搭配推荐；避免长时间暴晒，睡觉时可取下让手腕休息。' },
  ];
}

function buildCrystalPage(sku: string, product: ProductRow, all: ProductRow[]): GeneratedPage {
  const cfg = CRYSTAL_SATYA[sku];
  if (!cfg) throw new Error(`missing crystal SATYA config: ${sku}`);

  const name = CRYSTAL_NAMES[sku] || product.name;
  const related = all
    .filter((p) => p.category === 'crystal' && p.sku !== sku)
    .map((p) => p.sku);

  const video =
    sku === 'crystal-metal'
      ? {
          galleryVideoUrl: 'https://shop.orasage.com/videos/crystal-metal-scene.mp4',
          sceneVideoUrl: 'https://shop.orasage.com/videos/crystal-metal-scene.mp4',
        }
      : {};

  return {
    subtitle: cfg.subtitle,
    seoTitle: `${name} | OraSage Energy Shop`,
    seoDescription: `天然${cfg.stoneZh}能量手串，五行${cfg.element}行。${product.desc || product.description || ''}付款后 3–5 个工作日发货。`,
    ...video,
    sections: [
      { type: 'richText', body: crystalEnergyBlock(cfg) },
      { type: 'richText', body: crystalStoryBlock(cfg) },
      { type: 'specList', title: '我们的承诺', specItems: crystalPromiseItems(cfg) },
      {
        type: 'quote',
        quote: `${cfg.manifestEn}\n\n${cfg.manifestZh}`,
        attribution: MANIFEST_WEAR,
      },
      { type: 'guide', title: cfg.guideTitle, body: cfg.guideBody },
      { type: 'richText', body: crystalPairingBlock(cfg) },
      { type: 'faq', title: '常见问题', faqItems: crystalFaq() },
      { type: 'relatedSkus', title: '与之共振', relatedSkus: related.map((s) => ({ sku: s })) },
    ],
    testimonials: cfg.testimonials.map((t, i) => ({
      author: t.author,
      rating: 5,
      body: t.body,
      sort: (i + 1) * 10,
    })),
  };
}

type ReportTier = 'basic' | 'advanced' | 'premium' | 'legacy' | 'couple-basic' | 'couple-advanced' | 'couple-premium' | 'tarot' | 'daily' | 'bundle';

type ReportConfig = {
  app: '八字' | '紫微' | '塔罗';
  appEn: string;
  appUrl: string;
  tier: ReportTier;
  tierLabel: string;
  highlights: string[];
  storyTitle: string;
  storyBody: string;
  manifestEn: string;
  manifestZh: string;
  guideBody: string;
  upsellLines: string[];
  testimonials: Array<{ author: string; body: string }>;
};

function parseReportSku(sku: string): ReportConfig | null {
  if (sku.startsWith('report-bazi')) {
    const isCouple = sku.includes('couple');
    const tier: ReportTier = sku.includes('premium')
      ? isCouple
        ? 'couple-premium'
        : 'premium'
      : sku.includes('advanced')
        ? isCouple
          ? 'couple-advanced'
          : 'advanced'
        : sku.includes('couple')
          ? 'couple-basic'
          : 'basic';

    const tierLabels: Record<ReportTier, string> = {
      legacy: '完整命盘 · 数字交付',
      basic: '深度解读 · 数字交付',
      advanced: '解读 + 五行水晶推荐',
      premium: '完整报告 + 能量礼盒',
      'couple-basic': '双人合盘 · 数字交付',
      'couple-advanced': '合盘解读 + 双人水晶推荐',
      'couple-premium': '合盘礼盒 · 实体交付',
      tarot: '',
      daily: '',
      bundle: '',
    };

    const highlights: Record<ReportTier, string[]> = {
      legacy: ['四柱命盘完整解析', '十神与格局要点', '大运流年趋势', 'PDF 可下载保存'],
      basic: ['AI 深度命盘解读', '十神格局与用神', '大运流年提示', '登录八字 App 随时查看'],
      advanced: ['包含基础版全部内容', '五行强弱可视化', '专属水晶 SKU 推荐', '可选实体手串发货'],
      premium: ['包含进阶版全部内容', '定制能量礼盒', '实体水晶 + 精美包装', '附赠使用指南卡片'],
      'couple-basic': ['双人四柱合盘', '关系互动模式分析', '相处建议与注意点', '数字报告即时解锁'],
      'couple-advanced': ['包含合盘基础版', '双人五行互补分析', '各推荐一款水晶', '可选实体发货'],
      'couple-premium': ['包含合盘进阶版', '双人能量礼盒', '实体水晶 + 仪式指南', '专属合盘纪念卡'],
      tarot: [],
      daily: [],
      bundle: [],
    };

    const manifests: Record<ReportTier, { en: string; zh: string }> = {
      legacy: {
        en: `I see my patterns. I choose my path.
My chart is a map — not a cage.`,
        zh: `我看见自己的模式。我选择自己的路。
命盘是地图——不是牢笼。`,
      },
      basic: {
        en: `I understand my nature. I act with awareness.
Knowledge turns fate into choice.`,
        zh: `我理解自己的本性。我清醒地做选择。
认知把命运变成选择。`,
      },
      advanced: {
        en: `I read my map. I carry my remedy.
Insight in mind, energy in hand.`,
        zh: `我读懂地图。我携带解药。
洞察在心里，能量在手上。`,
      },
      premium: {
        en: `I honor my journey. I gift myself wholeness.
Report and ritual, mind and body aligned.`,
        zh: `我尊重自己的旅程。我赠自己完整。
报告与仪式，身心对齐。`,
      },
      'couple-basic': {
        en: `We see each other clearly. We grow together.
Two maps woven into one story.`,
        zh: `我们清楚地看见彼此。我们共同成长。
两张地图织成同一个故事。`,
      },
      'couple-advanced': {
        en: `We understand our dance. We wear our harmony.
Insight shared, energy matched.`,
        zh: `我们懂得彼此的舞步。我们佩戴和谐。
洞察共享，能量相配。`,
      },
      'couple-premium': {
        en: `We celebrate our bond. We carry it daily.
A ritual for two, a gift for the journey.`,
        zh: `我们庆祝这份连接。我们每天携带它。
双人的仪式，旅程的礼物。`,
      },
      tarot: { en: '', zh: '' },
      daily: { en: '', zh: '' },
      bundle: { en: '', zh: '' },
    };

    const tierKey = tier;
    const isCoupleTier = tierKey.includes('couple');
    const isUpsellTier = tierKey.includes('premium') || tierKey.includes('advanced');
    return {
      app: '八字',
      appEn: 'BaZi',
      appUrl: 'https://bazi.orasage.com',
      tier: tierKey,
      tierLabel: tierLabels[tierKey],
      highlights: highlights[tierKey],
      storyTitle: isCouple ? '合盘解读的意义' : '八字解读的意义',
      storyBody: isCouple
        ? `合盘不是判断「配不配」，而是看见两个人能量如何互动：哪里天然共鸣，哪里需要刻意磨合，以及如何在差异中保持成长。

OraSage 合盘报告以双人四柱为基础，用结构化语言描述关系模式，避免简单的好/坏标签，给你们可讨论的框架。`
        : `八字以出生时刻的天地能量为起点，描绘一个人独特的「能量指纹」。它不是预言，而是一面镜子——帮你看见倾向、时机与选择。

OraSage 八字报告将传统术语转化为可理解的洞察，让你知道「我为什么是这样」，以及「我可以往哪里走」。`,
      manifestEn: manifests[tierKey].en,
      manifestZh: manifests[tierKey].zh,
      guideBody: isCouple
        ? `💑 确定关系方向前 → 了解彼此能量互动模式
🌙 争吵后冷静期 → 用报告框架讨论，而非情绪对抗
📅 重要节点（订婚、同居）→ 看见潜在磨合点
🎁 纪念日 → 作为「更懂彼此」的礼物`
        : `🌅 人生转折点前 → 了解当下大运与选择窗口
📋 职业迷茫时 → 查看十神格局与适合方向
🧘 自我探索期 → 每月重读，看见新层次
🎁 生日 → 送自己一份「看见自己」的礼物`,
      upsellLines: isCouple
        ? ['合盘基础版 → 进阶版：获得双人水晶推荐', '合盘进阶版 → 礼盒版：实体能量礼物']
        : ['基础版 → 进阶版：获得五行水晶推荐', '进阶版 → 礼盒版：实体能量礼盒到家'],
      testimonials: [
        { author: '林**', body: `八字报告比我预期的详细，${isCoupleTier ? '合盘' : '格局'}部分读完豁然开朗，不是那种吓人的宿命论。` },
        { author: '周**', body: '付款后几分钟就解锁了，手机上看着很方便。结构清晰，适合反复翻看。' },
        { author: '陈**', body: isUpsellTier ? '水晶推荐很准，和报告里说的五行弱点对上了。' : '先买了基础版，看完觉得值，准备升级进阶版。' },
      ],
    };
  }

  if (sku === 'report-ziwei' || sku.startsWith('report-ziwei')) {
    const tier: ReportTier = sku.includes('premium') ? 'premium' : sku.includes('advanced') ? 'advanced' : sku === 'report-ziwei' ? 'legacy' : 'basic';
    const tierLabels: Record<string, string> = {
      legacy: '十二宫详解 · 数字交付',
      basic: '深度解读 · 数字交付',
      advanced: '解读 + 五行水晶推荐',
      premium: '完整报告 + 能量礼盒',
    };
    const highlights: Record<string, string[]> = {
      legacy: ['十二宫完整解析', '主星辅星组合', '大限流年趋势', 'PDF 可下载'],
      basic: ['AI 紫微命盘解读', '十二宫要点', '大限流年提示', '登录紫微 App 查看'],
      advanced: ['包含基础版全部', '五行能量推荐', '专属水晶 SKU', '可选实体发货'],
      premium: ['包含进阶版全部', '定制能量礼盒', '实体水晶发货', '附赠指南卡片'],
    };
    const manifests: Record<string, { en: string; zh: string }> = {
      legacy: { en: `I see my stars. I navigate with grace.\nMy palace map lights the way.`, zh: `我看见自己的星曜。我优雅地导航。\n命盘之图照亮前路。` },
      basic: { en: `I know my nature. I choose my timing.\nThe stars suggest; I decide.`, zh: `我了解本性。我选择时机。\n星曜提示；我决定。` },
      advanced: { en: `I read my chart. I carry my balance.\nInsight and energy, aligned.`, zh: `我读懂命盘。我携带平衡。\n洞察与能量，对齐。` },
      premium: { en: `I honor my destiny. I gift myself ritual.\nMind mapped, energy held.`, zh: `我尊重命运。我赠自己仪式。\n心智有图，能量在握。` },
    };
    return {
      app: '紫微',
      appEn: 'Zi Wei',
      appUrl: 'https://ziwei.orasage.com',
      tier,
      tierLabel: tierLabels[tier] || tierLabels.basic,
      highlights: highlights[tier] || highlights.basic,
      storyTitle: '紫微斗数的现代解读',
      storyBody: `紫微斗数以十二宫描绘人生的十二个面向：命宫、财帛、事业、感情……每一宫的主星组合，都是理解自己的一把钥匙。

OraSage 紫微报告不追求「算得准不准」，而是帮你建立自我认知的框架——在迷茫时回到命盘，看看自己天生擅长什么、需要注意什么。`,
      manifestEn: manifests[tier]?.en || manifests.basic.en,
      manifestZh: manifests[tier]?.zh || manifests.basic.zh,
      guideBody: `🌟 人生规划前 → 查看事业宫与财帛宫
💕 感情困惑时 → 阅读夫妻宫与福德宫
📅 大限交替年 → 重读流年提示
🎁 新年 → 送自己一份年度指引`,
      upsellLines: ['基础版 → 进阶版：五行水晶推荐', '进阶版 → 礼盒版：实体能量礼盒'],
      testimonials: [
        { author: '王**', body: '紫微报告十二宫写得很清楚，比免费简读深太多，值得入手。' },
        { author: '张**', body: '大限部分读完对今年方向有底了，不是空话，有具体建议。' },
        { author: '李**', body: '解锁很快，和排盘 App 打通，体验顺畅。' },
      ],
    };
  }

  if (sku === 'report-tarot' || sku === 'tarot-daily-draw' || sku === 'report-tarot-bundle') {
    const tier: ReportTier =
      sku === 'report-tarot-bundle' ? 'bundle' : sku === 'tarot-daily-draw' ? 'daily' : 'tarot';
    const configs: Record<string, Partial<ReportConfig>> = {
      tarot: {
        tierLabel: '三牌阵深度解读',
        highlights: ['过去·现在·未来三牌阵', 'AI 四维深度解读', '行动建议与反思问题', '登录塔罗 App 查看'],
        guideBody: `🃏 面临选择时 → 抽取三牌阵获得视角
🌙 睡前反思 → 用牌面作为日记起点
📅 每周回顾 → 对比多次解读看见模式
🎁 送给朋友 → 一份「看见当下」的礼物`,
        upsellLines: ['单报告 → 礼包版：报告 + 实体能量法器'],
      },
      daily: {
        tierLabel: '每日运势加抽',
        highlights: ['当日运势四维解读', '免费次数用尽后加抽', '即时生成无需等待', '可截图分享'],
        guideBody: `☀️ 每天早晨 → 用运势开启一天觉察
🔄 免费次数用完后 → 加抽获得更深洞察
📱 通勤路上 → 一分钟阅读四维提示
🌙 睡前 → 回顾今日牌意与实际行动`,
        upsellLines: ['每日加抽 → 三牌阵深度报告：看见更大图景'],
      },
      bundle: {
        tierLabel: '深度解读 + 能量法器',
        highlights: ['三牌阵完整报告', '专属能量法器实体', '报告与实体联动指南', '礼盒包装发货'],
        guideBody: `🎁 重要节点 → 报告+法器作为仪式套装
🧘 冥想前 → 手持法器，重读报告行动建议
📦 收到后 → 按指南卡片完成首次净化
💌 送礼 → 一份完整的能量体验`,
        upsellLines: ['已购单报告 → 联系客服补差价升级礼包'],
      },
    };
    const c = configs[tier] || configs.tarot!;
    return {
      app: '塔罗',
      appEn: 'Tarot',
      appUrl: 'https://tarot.orasage.com',
      tier,
      tierLabel: c.tierLabel!,
      highlights: c.highlights!,
      storyTitle: '塔罗作为觉察工具',
      storyBody: `塔罗不是预测铁定的未来，而是在当下抽一张（或一组）牌，借象征语言触碰潜意识——那些你已经知道、却还没说出口的感受。

OraSage 塔罗解读以心理学与象征学为骨架，避免恐吓式预言，给你可以带走的问题与行动建议。`,
      manifestEn:
        tier === 'daily'
          ? `I greet today with awareness. I trust the draw.\nEach card a mirror, each day a choice.`
          : `I see the pattern. I choose my next step.\nThe cards illuminate; I walk.`,
      manifestZh:
        tier === 'daily'
          ? `我以觉察迎接今日。我信任抽牌。\n每张牌是一面镜，每天是一个选择。`
          : `我看见模式。我选择下一步。\n牌面照亮；我行走。`,
      guideBody: c.guideBody!,
      upsellLines: c.upsellLines!,
      testimonials: [
        { author: '赵**', body: tier === 'daily' ? '每日运势很准不准不重要，关键是逼自己每天想一分钟。' : '三牌阵解读很细，行动建议接地气。' },
        { author: '吴**', body: '比免费版深很多，牌意联系生活场景，读完有方向感。' },
        { author: '郑**', body: tier === 'bundle' ? '法器质感好，和报告一起用很有仪式感。' : '解锁快，手机上随时看。' },
      ],
    };
  }

  return null;
}

function buildReportPage(sku: string, product: ProductRow, all: ProductRow[]): GeneratedPage {
  const cfg = parseReportSku(sku);
  if (!cfg) throw new Error(`missing report SATYA config: ${sku}`);

  const highlightBlock = cfg.highlights.map((h) => `• ${h}`).join('\n');
  const upsellBlock = cfg.upsellLines.map((l) => `• ${l}`).join('\n');

  const familyPrefix = sku.includes('couple')
    ? 'report-bazi-couple'
    : sku.includes('bazi')
      ? 'report-bazi'
      : sku.includes('ziwei')
        ? 'report-ziwei'
        : 'report-tarot';

  const related = all
    .filter((p) => {
      if (p.sku === sku) return false;
      if (sku.startsWith('tarot') || sku === 'report-tarot' || sku === 'report-tarot-bundle') {
        return p.sku.includes('tarot') || p.sku === 'report-tarot' || p.sku === 'report-tarot-bundle';
      }
      return p.sku.startsWith(familyPrefix) || p.sku === familyPrefix.replace('-basic', '');
    })
    .slice(0, 4)
    .map((p) => p.sku);

  const shipping = product.requiresShipping ?? /advanced|premium|bundle/i.test(sku);

  return {
    subtitle: `${cfg.appEn} · ${cfg.tierLabel}`,
    seoTitle: `${product.name} | OraSage ${cfg.app}解读`,
    seoDescription: `${product.name}。${product.desc || product.description || ''}${shipping ? '含实体发货。' : '数字交付，付款后即可查看。'}`,
    sections: [
      {
        type: 'richText',
        body: `✦ ${cfg.app}解读 — ${cfg.tierLabel}

本报告包含：
${highlightBlock}

✦ 交付方式

${shipping ? '数字报告解锁 + 实体商品物流发货，物流信息可在订单页查看。' : '付款成功后自动解锁，登录对应 App 即可查看完整内容。'}`,
      },
      { type: 'richText', body: `── ${cfg.storyTitle} ──\n\n${cfg.storyBody}` },
      {
        type: 'specList',
        title: '我们的承诺',
        specItems: [
          { label: '报告类型', value: cfg.tierLabel },
          { label: '生成方式', value: 'OraSage AI + 命理知识库联合生成' },
          { label: '交付时效', value: shipping ? '报告数分钟内解锁；实体 3–5 个工作日发货' : '付款后数分钟内可查看' },
          { label: '支持语言', value: '简体中文（首期）' },
        ],
      },
      {
        type: 'quote',
        quote: `${cfg.manifestEn}\n\n${cfg.manifestZh}`,
        attribution: MANIFEST_READ,
      },
      { type: 'guide', title: `何时使用${cfg.app}解读`, body: cfg.guideBody },
      { type: 'richText', body: `── 升级路径 ──\n\n${upsellBlock}` },
      {
        type: 'faq',
        title: '常见问题',
        faqItems: [
          { question: '报告多久可以查看？', answer: '数字报告通常在付款成功后数分钟内可用；高峰时段可能略有延迟。' },
          {
            question: '可以退款吗？',
            answer: shipping
              ? '数字内容解锁后原则上不退款；实体未发货前请联系客服。'
              : '数字内容一经解锁原则上不支持退款，请先体验免费简读再决定。',
          },
          { question: '报告在哪里查看？', answer: `登录 ${cfg.appUrl.replace('https://', '')} ，在报告中心或订单提示入口查看。` },
        ],
      },
      ...(related.length
        ? [{ type: 'relatedSkus', title: '与之共振', relatedSkus: related.map((s) => ({ sku: s })) }]
        : []),
    ],
    testimonials: cfg.testimonials.map((t, i) => ({
      author: t.author,
      rating: 5,
      body: t.body,
      sort: (i + 1) * 10,
    })),
  };
}

function buildServicePage(sku: string, product: ProductRow, all: ProductRow[]): GeneratedPage {
  const isDonation = sku === 'temple-donation';
  const isChat = sku.includes('ziwei-chat');

  const configs: Record<string, { subtitle: string; body: string; specs: Array<{ label: string; value: string }>; guide: string; manifestEn: string; manifestZh: string; testimonials: Array<{ author: string; body: string }> }> = {
    'ziwei-chat-pack-10': {
      subtitle: 'Zi Wei Chat Pack · 10 Credits',
      body: `✦ 紫微问答加量包 — 10 次对话

为 Orasage 紫微对话充值 10 次额外提问额度：
• 跨排盘累积，不会过期清零
• 在命盘解读后追问「为什么」「怎么办」
• 比单次购买更实惠

✦ 适合谁

已经体验过免费问答、想要更深入追问排盘细节的用户。`,
      specs: [
        { label: '额度', value: '10 次 OraSage 对话' },
        { label: '有效期', value: '永久累积，不过期' },
        { label: '生效方式', value: '付款后自动充值到紫微账户' },
      ],
      guide: `🌟 读完排盘报告后 → 追问「这个星曜对我意味着什么」
💬 日常疑惑 → 用对话快速获得视角
📅 大限交替年 → 集中提问，消耗额度
🎁 送给朋友 → 一份可累积的对话礼物`,
      manifestEn: `I ask deeper. I understand more.\nEach question opens a new door.`,
      manifestZh: `我问得更深。我更理解。\n每个问题打开一扇新门。`,
      testimonials: [
        { author: '王**', body: '加量包很实惠，到账快，排盘完接着问方便多了。' },
        { author: '张**', body: '10 次够用很久，跨排盘累积很人性化。' },
        { author: '李**', body: '对话质量比预期好，不是机械回复。' },
      ],
    },
    'ziwei-chat-yearly': {
      subtitle: 'Zi Wei Chat Yearly · Unlimited',
      body: `✦ 紫微问答年卡 — 365 天无限对话

一整年 unlimited OraSage 对话权限：
• 任意排盘、任意追问
• 适合深度使用者与学习者
• 日均成本远低于单次加量

✦ 适合谁

紫微爱好者、从业者、或一年内有多张命盘要解读的用户。`,
      specs: [
        { label: '权益', value: '365 天无限 OraSage 对话' },
        { label: '生效', value: '付款后立即生效' },
        { label: '续费', value: '到期前可续费延长' },
      ],
      guide: `📚 学习紫微期间 → 随时提问巩固理解
👨‍👩‍👧 为家人排盘 → 一年内 unlimited 解读
💼 从业者辅助 → 客户命盘快速追问
🎁 新年礼物 → 送一年的对话陪伴`,
      manifestEn: `I explore freely. I learn daily.\nA year of questions, a lifetime of insight.`,
      manifestZh: `我自由探索。我每天学习。\n一年的提问，一生的洞察。`,
      testimonials: [
        { author: '赵**', body: '重度用户必备，算过日均成本很划算。' },
        { author: '吴**', body: '给爸妈排盘这一年随便问，他们很喜欢。' },
        { author: '郑**', body: '无限对话让学习紫微轻松很多。' },
      ],
    },
    'temple-donation': {
      subtitle: 'Temple Blessing · Voluntary Support',
      body: `✦ 祈福乐捐 — 自愿支持

您的每一份乐捐用于支持 OraSage 祈福体系的持续运营：
• 服务器与基础设施
• 内容与体验优化
• 祈福功能的长期维护

金额可在结账时自愿选择（$0.01–$1），感谢您的支持。`,
      specs: [
        { label: '性质', value: '自愿乐捐，非商品交易' },
        { label: '金额', value: '结账时自选 $0.01–$1' },
        { label: '用途', value: '祈福体系运营与维护' },
      ],
      guide: `🙏 祈福后心怀感激 → 自愿支持平台
🌸 体验满意时 → 小小乐捐表达感谢
💫 无压力 → 金额完全自愿，一分也是心意`,
      manifestEn: `I give freely. I receive peace.\nA small gift, a shared blessing.`,
      manifestZh: `我自愿给予。我收获安宁。\n一份小礼物，共享的祝福。`,
      testimonials: [
        { author: '孙**', body: '祈福体验很好，乐捐也是支持平台持续运营，愿大家都平安。' },
        { author: '林**', body: '金额随意很人性化，一分也是心意。' },
        { author: '周**', body: '每次祈福完会乐捐一点，感觉参与了共建。' },
      ],
    },
  };

  const cfg = configs[sku];
  if (!cfg) throw new Error(`missing service SATYA config: ${sku}`);

  const related = all
    .filter((p) => {
      if (p.sku === sku) return false;
      if (isChat) return p.sku.includes('ziwei-chat');
      if (isDonation) return p.category === 'crystal';
      return p.category === product.category;
    })
    .slice(0, 4)
    .map((p) => p.sku);

  const storyBody = isDonation
    ? `OraSage 祈福体系连接古今祈愿传统与现代数字体验。乐捐不是购买商品，而是对这份连接的自愿维护——让祈福功能持续可用、体验持续优化。

每一分钱都用于基础设施与内容建设，透明、轻量、无压力。`
    : isChat
      ? `紫微斗数博大精深，排盘之后的「追问」往往是理解的关键。OraSage 对话将 AI 与命理知识库结合，让你可以用自然语言深入探索命盘细节。

加量包与年卡让不同深度的用户都能找到适合自己的方式。`
      : `有时我们需要的不是一份报告，而是一个愿意认真听、能帮你理清的人。30 分钟咨询聚焦你的真实困惑，结合命理视角给出可执行的建议。`;

  return {
    subtitle: cfg.subtitle,
    seoTitle: `${product.name} | OraSage 能量服务`,
    seoDescription: `${product.name}。${product.desc || product.description || ''}`,
    sections: [
      { type: 'richText', body: cfg.body },
      {
        type: 'richText',
        body: `── ${isDonation ? '祈福与乐捐' : isChat ? '对话的力量' : '咨询的意义'} ──\n\n${storyBody}`,
      },
      { type: 'specList', title: '服务说明', specItems: cfg.specs },
      {
        type: 'quote',
        quote: `${cfg.manifestEn}\n\n${cfg.manifestZh}`,
        attribution: MANIFEST_ACT,
      },
      { type: 'guide', title: '何时使用', body: cfg.guide },
      {
        type: 'faq',
        title: '常见问题',
        faqItems: [
          { question: '购买后如何生效？', answer: '登录同一 OraSage 账户，权益自动同步到对应服务入口。' },
          { question: '可以转让吗？', answer: '账户权益与购买账号绑定，不支持转让或折现。' },
          ...(isConsult
            ? [{ question: '如何预约？', answer: '付款后 24 小时内顾问通过订单联系方式与您确认时段。' }]
            : []),
        ],
      },
      ...(related.length
        ? [{ type: 'relatedSkus', title: '与之共振', relatedSkus: related.map((s) => ({ sku: s })) }]
        : []),
    ],
    testimonials: cfg.testimonials.map((t, i) => ({
      author: t.author,
      rating: 5,
      body: t.body,
      sort: (i + 1) * 10,
    })),
  };
}

export function generateSatyaPage(product: ProductRow, all: ProductRow[]): GeneratedPage {
  if (product.category === 'crystal' && CRYSTAL_SATYA[product.sku]) {
    return buildCrystalPage(product.sku, product, all);
  }
  if (product.category === 'report') {
    return buildReportPage(product.sku, product, all);
  }
  if (product.category === 'service') {
    return buildServicePage(product.sku, product, all);
  }
  throw new Error(`unsupported product: ${product.sku}`);
}

export function satyaDisplayName(sku: string, fallback: string): string {
  return CRYSTAL_NAMES[sku] || fallback;
}
