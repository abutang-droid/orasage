import type { ProductPageSection } from './cms-product-page';

export type PdpAccordionItem = {
  id: string;
  title: string;
  sections: ProductPageSection[];
};

export type PdpContent = {
  accordions: PdpAccordionItem[];
  manifest: ProductPageSection | null;
  quote: ProductPageSection | null;
  relatedSkus: string[];
  relatedTitle?: string;
};

const CRYSTAL_SKUS = [
  'crystal-wood',
  'crystal-fire',
  'crystal-earth',
  'crystal-metal',
  'crystal-water',
] as const;

const CRYSTAL_MATERIALS: Record<string, string> = {
  'crystal-wood': '天然绿幽灵',
  'crystal-fire': '天然红玛瑙',
  'crystal-earth': '天然黄水晶',
  'crystal-metal': '天然白水晶',
  'crystal-water': '天然黑曜石',
};

const REPORT_EYEBROWS: Array<{ match: (sku: string) => boolean; label: string }> = [
  { match: (sku) => sku.includes('bazi'), label: '八字解读 · 数字报告' },
  { match: (sku) => sku.includes('ziwei'), label: '紫微斗数 · 数字报告' },
  { match: (sku) => sku.includes('tarot') || sku === 'tarot-daily-draw', label: '塔罗解读 · 数字报告' },
];

const SERVICE_EYEBROWS: Record<string, string> = {
  'service-consult': '能量咨询 · 一对一',
  'ziwei-chat-pack-10': '紫微问答 · 加量包',
  'ziwei-chat-yearly': '紫微问答 · 年卡',
  'temple-donation': '祈福乐捐 · 自愿支持',
};

/** 标题上方小字：水晶/报告/服务类目标签 */
export function productEyebrow(
  sku: string,
  element?: string | null,
  material?: string | null,
  /** 本地化「五行·{element} · {material}」；未传则回退中文格式 */
  formatCrystalEyebrow?: (element: string, material: string) => string,
): string | null {
  const resolvedMaterial = material?.trim() || CRYSTAL_MATERIALS[sku];
  if (resolvedMaterial) {
    if (!element) return resolvedMaterial;
    return formatCrystalEyebrow
      ? formatCrystalEyebrow(element, resolvedMaterial)
      : `五行·${element} · ${resolvedMaterial}`;
  }

  const report = REPORT_EYEBROWS.find((r) => r.match(sku));
  if (report) return report.label;

  return SERVICE_EYEBROWS[sku] ?? null;
}

function firstRichTitle(body: string): string {
  if (body.includes('✦')) {
    if (body.includes('解读') || body.includes('运势') || body.includes('牌阵')) return '报告详解';
    if (body.includes('咨询') || body.includes('对话') || body.includes('乐捐')) return '服务详解';
    return '能量详解';
  }
  return '商品详情';
}

function laterRichTitle(body: string): string {
  if (body.includes('图谱') || body.includes('灵性')) return '灵性故事';
  if (body.includes('方法论') || body.includes('意义') || body.includes('觉察') || body.includes('祈福')) {
    return '深度解读';
  }
  return '更多介绍';
}

/** 将 CMS sections 归类为折叠面板 + 页面时刻（显化引文 / 推荐语 / 相关商品） */
export function buildPdpContent(sections: ProductPageSection[]): PdpContent {
  const buckets = new Map<string, PdpAccordionItem>();
  const order = ['details', 'story', 'extra', 'promise', 'guide', 'faq'];
  let manifest: ProductPageSection | null = null;
  let quote: ProductPageSection | null = null;
  let relatedSkus: string[] = [];
  let relatedTitle: string | undefined;
  let richCount = 0;

  const put = (id: string, title: string, section: ProductPageSection) => {
    const existing = buckets.get(id);
    if (existing) {
      existing.sections.push(section);
    } else {
      buckets.set(id, { id, title, sections: [section] });
    }
  };

  for (const section of sections) {
    if (section.type === 'quote' && section.quote) {
      if (section.attribution?.includes('Manifest')) manifest = section;
      else quote = section;
      continue;
    }

    if (section.type === 'relatedSkus') {
      relatedSkus = section.relatedSkus ?? [];
      relatedTitle = section.title;
      continue;
    }

    if (section.type === 'richText' && section.body) {
      richCount += 1;
      if (richCount === 1) {
        put('details', firstRichTitle(section.body), section);
      } else if (section.body.includes('搭配') || section.body.includes('升级路径')) {
        put('guide', section.body.includes('升级') ? '升级路径' : '佩戴指南与搭配', section);
      } else {
        put(buckets.has('story') ? 'extra' : 'story', laterRichTitle(section.body), section);
      }
      continue;
    }

    if (section.type === 'specList' && section.specItems?.length) {
      put('promise', section.title || '商品规格', section);
      continue;
    }

    if (section.type === 'guide' && (section.title || section.body)) {
      put('guide', section.title || '佩戴指南', section);
      continue;
    }

    if (section.type === 'faq' && section.faqItems?.length) {
      put('faq', section.title || '常见问题', section);
      continue;
    }
  }

  const guide = buckets.get('guide');
  if (guide && guide.sections.length > 1) {
    const hasUpgrade = guide.sections.some(
      (s) => s.type === 'richText' && s.body?.includes('升级'),
    );
    guide.title = hasUpgrade ? '使用指南与升级' : '佩戴指南与搭配';
  }

  const accordions = order
    .map((id) => buckets.get(id))
    .filter((item): item is PdpAccordionItem => Boolean(item));

  return { accordions, manifest, quote, relatedSkus, relatedTitle };
}

/** CMS 无 specList 时，注入 auth-service 结构化规格 */
export function injectProductSpecs(
  content: PdpContent,
  specs: Array<{ label: string; value: string }>,
  title = '商品规格',
): PdpContent {
  if (!specs.length) return content;
  const hasSpec = content.accordions.some((a) =>
    a.sections.some((s) => s.type === 'specList'),
  );
  if (hasSpec) return content;

  const specAccordion: PdpAccordionItem = {
    id: 'specs',
    title,
    sections: [
      {
        type: 'specList',
        title,
        specItems: specs.map((s) => ({ label: s.label, value: s.value })),
      },
    ],
  };

  return {
    ...content,
    accordions: [specAccordion, ...content.accordions],
  };
}

/** 五行水晶 PDP：与之共振固定推荐其余 4 款水晶（CMS 可覆盖排序） */
export function resolveRelatedCrystalSkus(currentSku: string, cmsSkus: string[]): string[] {
  if (!CRYSTAL_SKUS.includes(currentSku as (typeof CRYSTAL_SKUS)[number])) {
    return cmsSkus.slice(0, 4);
  }
  const others = CRYSTAL_SKUS.filter((sku) => sku !== currentSku);
  const ordered: string[] = [];
  for (const sku of cmsSkus) {
    if (sku !== currentSku && others.includes(sku as (typeof CRYSTAL_SKUS)[number]) && !ordered.includes(sku)) {
      ordered.push(sku);
    }
  }
  for (const sku of others) {
    if (!ordered.includes(sku)) ordered.push(sku);
  }
  return ordered.slice(0, 4);
}
