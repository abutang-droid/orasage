import type { ProductPageSection } from './cms-product-page';
import { pickLocalizedTitle } from './pdp-i18n';

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

/** Locale-aware copy used when CMS omits titles or when Chinese titles leak into other locales. */
export type PdpContentLabels = {
  energyDetails: string;
  productDetails: string;
  reportDetails: string;
  serviceDetails: string;
  spiritualStory: string;
  deepReading: string;
  moreAbout: string;
  pairingGuide: string;
  upgradePath: string;
  wearGuide: string;
  wearGuidePairing: string;
  upgradeGuide: string;
  specs: string;
  faq: string;
  related: string;
  materials: Record<string, string>;
  eyebrowElement: string; // Element · {element} · {material}
  eyebrowMaterial: string; // {material}
  reportBazi: string;
  reportZiwei: string;
  reportTarot: string;
  serviceConsult: string;
  ziweiChatPack: string;
  ziweiChatYearly: string;
  templeDonation: string;
};

const CRYSTAL_SKUS = [
  'crystal-wood',
  'crystal-fire',
  'crystal-earth',
  'crystal-metal',
  'crystal-water',
] as const;

const DEFAULT_ZH_MATERIALS: Record<string, string> = {
  'crystal-wood': '天然绿幽灵',
  'crystal-fire': '天然红玛瑙',
  'crystal-earth': '天然黄水晶',
  'crystal-metal': '天然白水晶',
  'crystal-water': '天然黑曜石',
};

function hasCjk(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

function firstRichTitle(body: string, labels: PdpContentLabels): string {
  if (body.includes('✦')) {
    if (hasCjk(body)) {
      if (body.includes('解读') || body.includes('运势') || body.includes('牌阵')) {
        return labels.reportDetails;
      }
      if (body.includes('咨询') || body.includes('对话') || body.includes('乐捐')) {
        return labels.serviceDetails;
      }
      return labels.energyDetails;
    }
    const lower = body.toLowerCase();
    if (lower.includes('report') || lower.includes('reading') || lower.includes('spread')) {
      return labels.reportDetails;
    }
    if (lower.includes('consult') || lower.includes('chat') || lower.includes('donation')) {
      return labels.serviceDetails;
    }
    return labels.energyDetails;
  }
  return labels.productDetails;
}

function laterRichTitle(body: string, labels: PdpContentLabels): string {
  if (hasCjk(body)) {
    if (body.includes('图谱') || body.includes('灵性')) return labels.spiritualStory;
    if (body.includes('方法论') || body.includes('意义') || body.includes('觉察') || body.includes('祈福')) {
      return labels.deepReading;
    }
    return labels.moreAbout;
  }
  const lower = body.toLowerCase();
  if (lower.includes('spiritual') || lower.includes('profile') || lower.includes('tradition')) {
    return labels.spiritualStory;
  }
  if (lower.includes('method') || lower.includes('awareness') || lower.includes('blessing')) {
    return labels.deepReading;
  }
  return labels.moreAbout;
}

function isPairingBody(body: string): boolean {
  if (body.includes('搭配') || body.includes('升级路径')) return true;
  const lower = body.toLowerCase();
  return lower.includes('combination') || lower.includes('pairing') || lower.includes('upgrade path');
}

function isUpgradeBody(body: string): boolean {
  return body.includes('升级') || body.toLowerCase().includes('upgrade');
}

/** 标题上方小字：水晶/报告/服务类目标签 */
export function productEyebrow(
  sku: string,
  element: string | null | undefined,
  material: string | null | undefined,
  labels: PdpContentLabels,
  localizedElement?: string | null,
): string | null {
  const resolvedMaterial =
    material?.trim() || labels.materials[sku] || DEFAULT_ZH_MATERIALS[sku];
  if (resolvedMaterial) {
    if (element) {
      return labels.eyebrowElement
        .replace('{element}', localizedElement || element)
        .replace('{material}', resolvedMaterial);
    }
    return labels.eyebrowMaterial.replace('{material}', resolvedMaterial);
  }

  if (sku.includes('bazi')) return labels.reportBazi;
  if (sku.includes('ziwei') && !sku.includes('chat')) return labels.reportZiwei;
  if (sku.includes('tarot') || sku === 'tarot-daily-draw') return labels.reportTarot;

  if (sku === 'service-consult') return labels.serviceConsult;
  if (sku === 'ziwei-chat-pack-10') return labels.ziweiChatPack;
  if (sku === 'ziwei-chat-yearly') return labels.ziweiChatYearly;
  if (sku === 'temple-donation') return labels.templeDonation;

  return null;
}

/** 将 CMS sections 归类为折叠面板 + 页面时刻（显化引文 / 推荐语 / 相关商品） */
export function buildPdpContent(
  sections: ProductPageSection[],
  labels: PdpContentLabels,
  locale = 'zh-CN',
): PdpContent {
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
      relatedTitle = pickLocalizedTitle(section.title, labels.related, locale);
      continue;
    }

    if (section.type === 'richText' && section.body) {
      richCount += 1;
      if (richCount === 1) {
        put('details', firstRichTitle(section.body, labels), section);
      } else if (isPairingBody(section.body)) {
        put('guide', isUpgradeBody(section.body) ? labels.upgradePath : labels.pairingGuide, section);
      } else {
        put(buckets.has('story') ? 'extra' : 'story', laterRichTitle(section.body, labels), section);
      }
      continue;
    }

    if (section.type === 'specList' && section.specItems?.length) {
      put(
        'promise',
        pickLocalizedTitle(section.title, labels.specs, locale),
        section,
      );
      continue;
    }

    if (section.type === 'guide' && (section.title || section.body)) {
      put(
        'guide',
        pickLocalizedTitle(section.title, labels.wearGuide, locale),
        section,
      );
      continue;
    }

    if (section.type === 'faq' && section.faqItems?.length) {
      put(
        'faq',
        pickLocalizedTitle(section.title, labels.faq, locale),
        section,
      );
      continue;
    }
  }

  const guide = buckets.get('guide');
  if (guide && guide.sections.length > 1) {
    const hasUpgrade = guide.sections.some(
      (s) => s.type === 'richText' && s.body && isUpgradeBody(s.body),
    );
    guide.title = hasUpgrade ? labels.upgradeGuide : labels.wearGuidePairing;
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
