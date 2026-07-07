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
    subtitle: '净化能量 · 清晰思绪 · 五行补金',
    seoTitle: '白水晶手串 · 净化与专注 | OraSage Energy Shop',
    seoDescription:
      '天然白水晶手串，温和净化负能量，帮助稳定情绪、提升专注。适合五行缺金或需要清晰决策的你。',
    sections: [
      {
        type: 'richText',
        body: '白水晶被誉为「水晶之王」，能量纯净而稳定。日常佩戴可帮助舒缓浮躁心绪，让思绪更清晰，也适合冥想、学习或重要会议前佩戴。\n\n本款手串选用天然石料，珠径约 8mm，手感温润，适合日常通勤与休闲场合。',
      },
      {
        type: 'specList',
        title: '商品规格',
        specItems: [
          { label: '材质', value: '天然白水晶' },
          { label: '珠径', value: '约 8mm' },
          { label: '五行', value: '金' },
          { label: '手围', value: '下单时可选手围（15–19cm）' },
          { label: '发货', value: '实体手串，付款后 3–5 个工作日发出' },
        ],
      },
      {
        type: 'guide',
        title: '佩戴建议',
        body: '建议佩戴在左手，便于吸收与稳定能量。避免与硬物碰撞，洗澡、游泳时取下可延长光泽。\n\n收到后可用清水轻冲、阴干即可，无需复杂消磁仪式。',
      },
      {
        type: 'quote',
        quote: '白水晶像一束温和的光，不张扬，却能让心慢慢静下来。',
        attribution: 'OraSage 能量顾问',
      },
      {
        type: 'faq',
        title: '常见问题',
        faqItems: [
          {
            question: '如何选手围？',
            answer: '结账时选择手围尺码；若介于两档之间，建议选大一号，佩戴更舒适。',
          },
          {
            question: '可以和其他水晶一起戴吗？',
            answer: '可以。白水晶性质温和，常与粉晶、黑曜石等搭配，注意避免长时间暴晒即可。',
          },
        ],
      },
      {
        type: 'relatedSkus',
        relatedSkus: [{ sku: 'crystal-earth' }, { sku: 'crystal-water' }],
      },
    ],
    testimonials: [
      {
        author: '林**',
        rating: 5,
        body: '收到比图片更有质感，戴了一周感觉心绪平稳了不少，包装也很用心。',
        sort: 10,
      },
      {
        author: '周**',
        rating: 5,
        body: '五行缺金，顾问推荐这款。珠子通透，日常办公戴着很安心。',
        sort: 20,
      },
      {
        author: '陈**',
        rating: 4,
        body: '物流很快，手串做工精细。希望后续能出更大珠径的款式。',
        sort: 30,
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
