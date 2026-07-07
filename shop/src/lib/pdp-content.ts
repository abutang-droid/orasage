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

/** 标题上方小字：水晶 SKU 显示「五行·X · 材质」，其余返回 null 走类目回退 */
export function productEyebrow(sku: string, element?: string | null): string | null {
  const material = CRYSTAL_MATERIALS[sku];
  if (!material) return null;
  return element ? `五行·${element} · ${material}` : material;
}

function firstRichTitle(body: string): string {
  if (body.includes('✦')) return '能量详解';
  return '商品详情';
}

function laterRichTitle(body: string): string {
  if (body.includes('图谱') || body.includes('灵性')) return '灵性故事';
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
      if (section.attribution?.includes('Wear to Manifest')) manifest = section;
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
      } else if (section.body.includes('搭配')) {
        put('guide', '佩戴指南与搭配', section);
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
    guide.title = '佩戴指南与搭配';
  }

  const accordions = order
    .map((id) => buckets.get(id))
    .filter((item): item is PdpAccordionItem => Boolean(item));

  return { accordions, manifest, quote, relatedSkus, relatedTitle };
}

/** 五行水晶 PDP：与之共振固定推荐其余 4 款水晶（CMS 可覆盖排序） */
export function resolveRelatedCrystalSkus(currentSku: string, cmsSkus: string[]): string[] {
  if (!CRYSTAL_SKUS.includes(currentSku as (typeof CRYSTAL_SKUS)[number])) {
    return cmsSkus;
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
