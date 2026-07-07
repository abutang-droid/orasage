/**
 * SATYA 五层结构优化：crystal-metal（澄明之境 · 白水晶能量手串）
 * Usage (from cms/):
 *   DATABASE_URL=... PAYLOAD_SECRET=... npx tsx scripts/seed-crystal-metal-satya.ts
 */
import { getPayload } from 'payload';
import config from '../src/payload.config';

const SKU = 'crystal-metal';

const SATYA_PAGE = {
  subtitle: 'Clarity Unveiled Clear Quartz Bracelet',
  seoTitle: '澄明之境 · 白水晶能量手串 | OraSage Energy Shop',
  seoDescription:
    '天然白水晶能量手串，被称为 Master Healer。净化能量场、放大正向意图，适合需要清晰决策与五行补金的你。',
  galleryVideoUrl: 'https://shop.orasage.com/videos/crystal-metal-scene.mp4',
  sceneVideoUrl: 'https://shop.orasage.com/videos/crystal-metal-scene.mp4',
  sections: [
    {
      type: 'richText',
      body: `✦ Clear Quartz — 水晶之王

被称为「Master Healer」，其纯净振频能够：
• 净化周围能量场，驱散思维迷雾
• 放大正向意图，增强专注力和决断力
• 平衡身心振动，如同为灵魂开了一扇窗

✦ 五行属性 — 金

金主收敛、主清晰、主边界。适合需要「看清方向」「做重要决定」「整理思绪」的人生阶段。

✦ 规格

• 天然白水晶珠，直径约 8mm
• 弹力绳穿制，适配 15–19cm 手围
• 每颗珠子因天然形成而独一无二`,
    },
    {
      type: 'richText',
      body: `── 白水晶的灵性图谱 ──

几乎每一种古老传统中，透明水晶都占据着特殊的位置。

在喜马拉雅修行传统中，白水晶被视为「冻结的光」，认为它捕捉了第一缕阳光的纯粹能量。西藏僧侣用它来触碰脉轮、标记冥想空间的神圣边界。

古希腊人相信白水晶是「来自冰神的神赐礼物」，Plato 在《蒂迈欧篇》中将其描述为一种「穿透物质世界、直达理念世界的透明介质」。

北美原住民的萨满用白水晶来做「看见」——他们相信晶体能放大内在视觉，让人看到隐藏在表象之下的事物真相。

现代能量疗愈师称其为万能放大器（amplifier），因为它不带有特定色彩偏频，而是均匀地放大你放入其中的任何意图。

这不是装饰品。这是一扇窗。`,
    },
    {
      type: 'specList',
      title: '我们的承诺',
      specItems: [
        {
          label: '天然石料',
          value: '每颗白水晶均经手工筛选，保持天然冰裂纹理与内含物——那是地球的指纹',
        },
        {
          label: '手工穿制',
          value: '由经验丰富的工匠逐颗穿制，弹力绳选用日本进口水晶线，耐用且亲肤',
        },
        {
          label: '能量预处理',
          value: '每条手串出货前经过简单净化仪式（月光照射 + 鼠尾草烟熏）',
        },
        {
          label: '附赠',
          value: '绒布收纳袋 × 1 + 能量使用指南卡片 × 1',
        },
      ],
    },
    {
      type: 'quote',
      quote: `I think clearly. I see through illusions.
My mind is a still lake, reflecting truth.

我想得清楚。我看透幻象。
我的心是一面宁静的湖，映照真相。`,
      attribution: '佩戴显化 · Wear to Manifest',
    },
    {
      type: 'guide',
      title: '何时佩戴白水晶',
      body: `🌅 重要决策前 → 让直觉穿过噪音
📚 学习 / 考试 → 增强专注与记忆
🧘 冥想 / 静心 → 加深进入安静的速度
💼 重要会议 / 谈判 → 保持清醒不被情绪带走
🌙 睡前 → 清理一天积累的思维碎片`,
    },
    {
      type: 'richText',
      body: `── 能量搭配推荐 ──

白水晶（放大器）+ 任何其他水晶 = 效果 ×2

• 白水晶 + 黑曜石 → 保护力强 + 保持清醒头脑
• 白水晶 + 粉水晶 → 清晰地感知爱（而不是盲目陷入）
• 白水晶 + 黄水晶 → 既看准机会又保持理性判断`,
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
          question: '白水晶需要消磁吗？',
          answer: '收到后可用清水轻冲、阴干即可。若感觉能量沉闷，可放在月光下静置一晚。',
        },
        {
          question: '可以和其他水晶一起戴吗？',
          answer: '可以。白水晶是万能放大器，常与黑曜石、粉晶、黄水晶搭配；避免长时间暴晒即可。',
        },
      ],
    },
    {
      type: 'relatedSkus',
      relatedSkus: [
        { sku: 'crystal-wood' },
        { sku: 'crystal-fire' },
        { sku: 'crystal-earth' },
        { sku: 'crystal-water' },
      ],
    },
  ],
  testimonials: [
    {
      author: '林**',
      rating: 5,
      body: '戴上之后开会脑子清楚多了，不像以前那么容易被人带节奏。珠子很通透，像把杂念滤掉了一层。',
      sort: 10,
    },
    {
      author: '周**',
      rating: 5,
      body: '八字说缺金，顾问推荐这款。名字「澄明之境」很戳我——每次抬手看见它，就会提醒自己：想清楚再说话。',
      sort: 20,
    },
    {
      author: '陈**',
      rating: 5,
      body: '肯定语卡片我截图设成壁纸了。备考那段时间每天戴着，心没那么慌，专注力确实稳了一些。',
      sort: 30,
    },
  ],
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
  const payload = await getPayload({ config });
  const mediaIds = await pickMediaIds(payload, 3);
  if (mediaIds.length === 0) {
    console.error('[seed-crystal-metal-satya] CMS 媒体库为空，请先在媒体库上传图片');
    process.exit(1);
  }

  const heroImages = mediaIds.map((imageId, index) => ({
    image: imageId,
    alt:
      index === 0
        ? '澄明之境 · 白水晶能量手串主图'
        : `澄明之境白水晶手串细节 ${index + 1}`,
    sort: index * 10,
  }));

  const pageData = {
    sku: SKU,
    locale: 'zh-CN' as const,
    status: 'published' as const,
    subtitle: SATYA_PAGE.subtitle,
    seoTitle: SATYA_PAGE.seoTitle,
    seoDescription: SATYA_PAGE.seoDescription,
    galleryVideoUrl: SATYA_PAGE.galleryVideoUrl,
    sceneVideoUrl: SATYA_PAGE.sceneVideoUrl,
    heroImages,
    sections: SATYA_PAGE.sections,
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
    console.log('[seed-crystal-metal-satya] updated shop-product-pages');
  } else {
    await payload.create({
      collection: 'shop-product-pages',
      data: pageData,
    });
    console.log('[seed-crystal-metal-satya] created shop-product-pages');
  }

  const existingTestimonials = await payload.find({
    collection: 'shop-product-testimonials',
    where: {
      and: [{ sku: { equals: SKU } }, { locale: { equals: 'zh-CN' } }],
    },
    limit: 100,
  });

  for (const doc of existingTestimonials.docs) {
    await payload.delete({
      collection: 'shop-product-testimonials',
      id: doc.id,
    });
  }
  if (existingTestimonials.docs.length) {
    console.log(
      `[seed-crystal-metal-satya] removed ${existingTestimonials.docs.length} old testimonials`,
    );
  }

  for (const t of SATYA_PAGE.testimonials) {
    await payload.create({
      collection: 'shop-product-testimonials',
      data: {
        sku: SKU,
        author: t.author,
        rating: t.rating,
        body: t.body,
        locale: 'zh-CN',
        sort: t.sort,
        enabled: true,
      },
    });
    console.log(`[seed-crystal-metal-satya] created testimonial: ${t.author}`);
  }

  console.log(`[seed-crystal-metal-satya] done → https://shop.orasage.com/product/${SKU}`);
}

main().catch((err) => {
  console.error('[seed-crystal-metal-satya]', err);
  process.exit(1);
});
