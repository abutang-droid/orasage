/** Keep in sync with MAKING_SKUS in ./index.ts (avoid circular import). */
type MakingSku =
  | 'crystal-wood'
  | 'crystal-fire'
  | 'crystal-earth'
  | 'crystal-metal'
  | 'crystal-water';

export type MakingSection = {
  titleEn: string;
  titleZh: string;
  paragraphs: { en: string; zh: string }[];
};

export type MakingStory = {
  sku: MakingSku;
  /** Short lead under the title when the story is published. */
  leadEn: string;
  leadZh: string;
  sections: MakingSection[];
};

/**
 * Published Making narratives. Keep claims inspectable (materials, craft, intention
 * framing) — no efficacy, fortune, or purification promises.
 */
export const MAKING_STORIES: Partial<Record<MakingSku, MakingStory>> = {
  'crystal-wood': {
    sku: 'crystal-wood',
    leadEn:
      'How we chose green phantom quartz, knotted the cord, and framed Growth as a reminder — not a guarantee.',
    leadZh: '我们如何选定绿幽灵、打结蜡线，并把「生长」写成提醒——而不是保证。',
    sections: [
      {
        titleEn: '2 · Why this stone',
        titleZh: '2 · 为什么是这颗石',
        paragraphs: [
          {
            en: 'Green phantom quartz shows layered inclusions that look like tiny forests under light. We picked it for that readable structure — something you can hold up to a window and describe — not for any claimed property beyond appearance and feel.',
            zh: '绿幽灵在光下可见层状包裹体，像微型林木。我们选它是因为结构可读——举到窗边就能描述——而非外观与手感之外的任何宣称属性。',
          },
          {
            en: 'Beads are sorted for similar diameter (8 mm target) and surface finish. Natural phantoms vary; we discard chips and cloudy lots that hide the inclusion pattern.',
            zh: '珠子按相近直径（目标 8 mm）与表面光洁度分拣。天然幽灵体有差异；碎裂与掩盖包裹体的浑浊批次会剔除。',
          },
        ],
      },
      {
        titleEn: '3 · Intention frame',
        titleZh: '3 · 意图框架',
        paragraphs: [
          {
            en: 'Wood · Growth is a journaling prompt: what are you cultivating this season? The bracelet is a bookmark for attention. It does not grow careers, heal bodies, or change outcomes on its own.',
            zh: '木 · 生长是日记提示：这一季你在培育什么？手串是注意力的书签。它不会自行推进事业、疗愈身体或改写结果。',
          },
          {
            en: 'If you wear it, pair it with one written action for the week. The object marks the rehearsal; you still do the work.',
            zh: '若佩戴，请配上本周一条书面行动。物件标记排练；行动仍须你来做。',
          },
        ],
      },
      {
        titleEn: '4 · Cord and knotting',
        titleZh: '4 · 线与结',
        paragraphs: [
          {
            en: 'We use waxed cord, hand-knotted between beads so a single break does not spill the strand. Ends finish in an adjustable sliding knot for 15–18 cm wrists.',
            zh: '使用蜡线，珠间手工打结，单点断裂不易整串散落。末端为可调滑结，适配 15–18 cm 腕围。',
          },
          {
            en: 'Knot spacing is checked on a sizing mandrel before packaging. No metal findings on the standard SKU — fewer snag points for daily wear.',
            zh: '包装前在量腕棒上检查结距。标准 SKU 无金属配件——减少日常勾挂点。',
          },
        ],
      },
      {
        titleEn: '5 · What we inspect',
        titleZh: '5 · 我们检查什么',
        paragraphs: [
          {
            en: 'Before a piece ships: bead count, cord integrity under light pull, clasp travel on the slider, and a photo of the finished loop against a scale card.',
            zh: '出货前：珠数、轻拉下的线体完整性、滑结行程，以及成品圈对照比例尺的照片。',
          },
          {
            en: 'We do not “charge,” “cleanse,” or ritually dedicate pieces. Care is ordinary: wipe dry after sweat, avoid sharp impacts, store away from harsh solvents.',
            zh: '我们不做「充能」「净化」或任何仪式性加工。护理很平常：出汗后擦干、避免重击、远离强溶剂存放。',
          },
        ],
      },
      {
        titleEn: '6 · Read next',
        titleZh: '6 · 继续阅读',
        paragraphs: [
          {
            en: 'For elemental vocabulary without product claims, see Insights → Crystal Companion · Green Phantom and Five Elements · Wood. Shop holds price, stock, and returns.',
            zh: '若要不含商品宣称的元素词汇，见玄析 → 水晶志 · 绿幽灵 与 五行 · 木。价格、库存与退换在商城。',
          },
        ],
      },
    ],
  },

  'crystal-fire': {
    sku: 'crystal-fire',
    leadEn:
      'Red agate for a visible warm tone, the same knotting system as Wood, and Courage framed as a cue before hard conversations.',
    leadZh: '红玛瑙取其可见暖色，结法与木款相同，并把「勇气」写成艰难对话前的提示。',
    sections: [
      {
        titleEn: '2 · Why this stone',
        titleZh: '2 · 为什么是这颗石',
        paragraphs: [
          {
            en: 'Red agate is opaque, even-colored, and easy to spot on the wrist — useful when the design job is “a warm full stop,” not transparency. We select for consistent hue and reject beads with sharp surface pits.',
            zh: '红玛瑙不透明、色相对匀，腕上易辨——设计目标是「一抹暖色的句点」，不是通透。我们选色相稳定者，剔除表面尖锐凹坑的珠。',
          },
          {
            en: 'Like the Wood line, beads target 8 mm. Fire does not get a different knotting recipe; shared tooling keeps sizing and repair notes identical across SKUs.',
            zh: '与木行一样，珠径目标 8 mm。火款不另开结法；共用工具让各 SKU 的尺码与维修说明一致。',
          },
        ],
      },
      {
        titleEn: '3 · Intention frame',
        titleZh: '3 · 意图框架',
        paragraphs: [
          {
            en: 'Fire · Courage means naming the meeting, the call, or the boundary you intend to keep. The bracelet is a pre-game cue. It does not supply bravery, luck, or persuasion power.',
            zh: '火 · 勇气指点名你打算守住的会议、电话或边界。手串是赛前提示。它不提供胆量、运气或说服力。',
          },
          {
            en: 'Try a thirty-second pause before the hard sentence. Let the object mark the pause — not the verdict.',
            zh: '试在难说出口的句子前停三十秒。让物件标记停顿——而不是裁决。',
          },
        ],
      },
      {
        titleEn: '4 · Cord and knotting',
        titleZh: '4 · 线与结',
        paragraphs: [
          {
            en: 'Waxed cord, hand knots between beads, adjustable 15–18 cm slider — the same mechanical stack as Realm of Growth. Colorway changes; construction does not.',
            zh: '蜡线、珠间手结、15–18 cm 可调滑结——与「生长之境」同一机械结构。变的是配色，不是构造。',
          },
        ],
      },
      {
        titleEn: '5 · What we inspect',
        titleZh: '5 · 我们检查什么',
        paragraphs: [
          {
            en: 'Hue band check under daylight lamp, knot security, slider travel, and scale-card photo. No ritual steps appear on the packing checklist.',
            zh: '日光灯下色带检查、结牢度、滑结行程与比例尺照片。装箱清单不含仪式步骤。',
          },
          {
            en: 'Care: wipe after sweat, avoid dropping on tile, keep solvents away from the cord wax.',
            zh: '护理：出汗后擦拭、避免摔到硬地、溶剂远离蜡线。',
          },
        ],
      },
      {
        titleEn: '6 · Read next',
        titleZh: '6 · 继续阅读',
        paragraphs: [
          {
            en: 'Insights → Crystal Companion · Red Agate and Five Elements · Fire. Verifiable price and shipping live on the Shop PDP.',
            zh: '玄析 → 水晶志 · 红玛瑙 与 五行 · 火。可核验价格与物流见商城单品页。',
          },
        ],
      },
    ],
  },

  'crystal-earth': {
    sku: 'crystal-earth',
    leadEn:
      'Citrine for a daylight-friendly yellow, shared adjustable construction, and Grounding as a list of ordinary stabilizers.',
    leadZh: '黄水晶取其日间易辨的黄色，构造与其他款共用，并把「稳固」写成一份平常的稳定器清单。',
    sections: [
      {
        titleEn: '2 · Why this stone',
        titleZh: '2 · 为什么是这颗石',
        paragraphs: [
          {
            en: 'Citrine (and citrine-colored quartz used in commercial grades) reads as warm yellow in indoor light — a practical cue for “baseline day” rather than a dramatic contrast stone. We sort for clarity bands and reject heavily fractured beads.',
            zh: '黄水晶（及商业级黄水晶色石英）在室内光下呈暖黄——更适合做「基线日」提示，而非强烈对比石。我们分拣净度带，剔除严重裂隙珠。',
          },
          {
            en: 'Treat color as a design choice. We do not claim prosperity, digestion, or mood effects from the stone.',
            zh: '把颜色当作设计选择。我们不宣称石头带来富足、消化或情绪功效。',
          },
        ],
      },
      {
        titleEn: '3 · Intention frame',
        titleZh: '3 · 意图框架',
        paragraphs: [
          {
            en: 'Earth · Grounding means maintenance: sleep window, meals, calendar blocks, backups. The bracelet can cue you to reopen that list — it does not stabilize life for you.',
            zh: '土 · 稳固指向维护：睡眠窗口、饮食、日程块、备份。手串可以提示你重开那份清单——它不会替你稳住生活。',
          },
          {
            en: 'When you clasp it on, write three stabilizers for the week. Keep the language mundane on purpose.',
            zh: '扣上时写下本周三个稳定器。语言刻意保持日常、可执行。',
          },
        ],
      },
      {
        titleEn: '4 · Cord and knotting',
        titleZh: '4 · 线与结',
        paragraphs: [
          {
            en: 'Same waxed cord and hand-knotted rhythm as Wood and Fire. Adjustable span stays 15–18 cm so one care card covers the collection.',
            zh: '蜡线与手结节奏同木、火款。可调跨度仍为 15–18 cm，使一张护理卡覆盖整列。',
          },
        ],
      },
      {
        titleEn: '5 · What we inspect',
        titleZh: '5 · 我们检查什么',
        paragraphs: [
          {
            en: 'Fracture screen, diameter sample, knot pull test, slider check, archival photo. Packaging lists materials and size — not blessings.',
            zh: '裂隙筛查、直径抽检、结拉力、滑结检查、存档照片。包装列材质与尺寸——不含玄学用语。',
          },
          {
            en: 'Care matches the line: dry wipe, soft pouch, no ultrasonic cleaners on the corded strand.',
            zh: '护理与同列一致：干擦、软袋、不对穿绳串使用超声波清洗。',
          },
        ],
      },
      {
        titleEn: '6 · Read next',
        titleZh: '6 · 继续阅读',
        paragraphs: [
          {
            en: 'Insights → Crystal Companion · Citrine and Five Elements · Earth. Shop carries checkout and after-sales terms.',
            zh: '玄析 → 水晶志 · 黄水晶 与 五行 · 土。结账与售后条款在商城。',
          },
        ],
      },
    ],
  },
};

export function getMakingStory(sku: MakingSku): MakingStory | undefined {
  return MAKING_STORIES[sku];
}

export function hasMakingStory(sku: string): boolean {
  return Object.prototype.hasOwnProperty.call(MAKING_STORIES, sku);
}
