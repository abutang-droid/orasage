/**
 * 为指定 SKU 写入商城详情页 + 精选评价示例（方案 C 验收用）
 * Usage (from cms/):
 *   DATABASE_URL=... PAYLOAD_SECRET=... npx tsx scripts/seed-shop-product-demo.ts
 *   SKU=crystal-wood npx tsx scripts/seed-shop-product-demo.ts
 */
import { getPayload } from 'payload';
import config from '../src/payload.config';

const SKU = process.env.SKU?.trim() || 'crystal-metal';

const DEMO_BY_SKU: Record<
  string,
  {
    subtitle: string;
    seoTitle: string;
    seoDescription: string;
    sections: Array<Record<string, unknown>>;
    testimonials: Array<{ author: string; rating: number; body: string; sort: number }>;
  }
> = {
  'crystal-metal': {
    subtitle: 'Clarity Unveiled Clear Quartz Bracelet',
    seoTitle: '澄明之境 · 白水晶能量手串 | OraSage Energy Shop',
    seoDescription:
      '天然白水晶能量手串，被称为 Master Healer。净化能量场、放大正向意图，适合需要清晰决策与五行补金的你。',
    sections: [
      {
        type: 'richText',
        body: `✦ Clear Quartz — 水晶之王

被称为「Master Healer」，其纯净振频能够：
• 净化周围能量场，驱散思维迷雾
• 放大正向意图，增强专注力和决断力
• 平衡身心振动，如同为灵魂开了一扇窗

✦ 五行属性 — 金

金主收敛、主清晰、主边界。适合需要「看清方向」「做重要决定」「整理思绪」的人生阶段。`,
      },
      {
        type: 'quote',
        quote: `I think clearly. I see through illusions.
My mind is a still lake, reflecting truth.

我想得清楚。我看透幻象。
我的心是一面宁静的湖，映照真相。`,
        attribution: '佩戴显化 · Wear to Manifest',
      },
    ],
    testimonials: [
      {
        author: '林**',
        rating: 5,
        body: '戴上之后开会脑子清楚多了，不像以前那么容易被人带节奏。珠子很通透，像把杂念滤掉了一层。',
        sort: 10,
      },
    ],
  },
};

async function pickMediaIds(payload: Awaited<ReturnType<typeof getPayload>>, count: number) {
  const media = await payload.find({
    collection: 'media',
    limit: count,
    sort: '-createdAt',
  });
  return media.docs.map((doc) => doc.id as number).filter(Boolean);
}

async function main() {
  const demo = DEMO_BY_SKU[SKU];
  if (!demo) {
    console.error(`[seed-shop-demo] 无内置示例数据: ${SKU}，当前支持: ${Object.keys(DEMO_BY_SKU).join(', ')}`);
    process.exit(1);
  }

  const payload = await getPayload({ config });
  const mediaIds = await pickMediaIds(payload, 3);
  if (mediaIds.length === 0) {
    console.error('[seed-shop-demo] CMS 媒体库为空，请先在媒体库上传图片');
    process.exit(1);
  }

  const heroImages = mediaIds.map((imageId, index) => ({
    image: imageId,
    alt: index === 0 ? '白水晶手串主图' : `白水晶手串细节 ${index + 1}`,
    sort: index * 10,
  }));

  const pageData = {
    sku: SKU,
    locale: 'zh-CN' as const,
    status: 'published' as const,
    subtitle: demo.subtitle,
    seoTitle: demo.seoTitle,
    seoDescription: demo.seoDescription,
    heroImages,
    sections: demo.sections,
  };

  const existingPage = await payload.find({
    collection: 'shop-product-pages',
    where: {
      and: [{ sku: { equals: SKU } }, { locale: { equals: 'zh-CN' } }],
    },
    limit: 1,
  });

  if (existingPage.docs[0]) {
    await payload.update({
      collection: 'shop-product-pages',
      id: existingPage.docs[0].id,
      data: pageData,
    });
    console.log(`[seed-shop-demo] updated shop-product-pages: ${SKU}`);
  } else {
    await payload.create({
      collection: 'shop-product-pages',
      data: pageData,
    });
    console.log(`[seed-shop-demo] created shop-product-pages: ${SKU}`);
  }

  for (const t of demo.testimonials) {
    const existing = await payload.find({
      collection: 'shop-product-testimonials',
      where: {
        and: [
          { sku: { equals: SKU } },
          { author: { equals: t.author } },
          { locale: { equals: 'zh-CN' } },
        ],
      },
      limit: 1,
    });
    const data = {
      sku: SKU,
      author: t.author,
      rating: t.rating,
      body: t.body,
      locale: 'zh-CN' as const,
      sort: t.sort,
      enabled: true,
    };
    if (existing.docs[0]) {
      await payload.update({
        collection: 'shop-product-testimonials',
        id: existing.docs[0].id,
        data,
      });
      console.log(`[seed-shop-demo] updated testimonial: ${t.author}`);
    } else {
      await payload.create({
        collection: 'shop-product-testimonials',
        data,
      });
      console.log(`[seed-shop-demo] created testimonial: ${t.author}`);
    }
  }

  console.log(`[seed-shop-demo] done → https://shop.orasage.com/product/${SKU}`);
}

main().catch((err) => {
  console.error('[seed-shop-demo]', err);
  process.exit(1);
});
