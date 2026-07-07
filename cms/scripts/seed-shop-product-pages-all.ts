/**
 * 为 auth-service 全部上架商品批量生成 CMS 详情页 + 精选评价（zh-CN）
 *
 * Usage (from cms/, on VPS):
 *   set -a && source .env && set +a && npm run seed:shop-pages-all
 *
 * Env:
 *   AUTH_INTERNAL_URL — default http://127.0.0.1:3101
 *   SKIP_TESTIMONIALS=1 — 仅生成详情页
 *   ONLY_MISSING=1 — 跳过已有详情页（默认 upsert 全部）
 */
import { getPayload } from 'payload';
import config from '../src/payload.config';
import { inferRequiresShipping, inferRequiresWristSize } from '../../shared/shop-fulfillment/index';

type ProductRow = {
  sku: string;
  name: string;
  element?: string | null;
  desc?: string;
  description?: string;
  category: 'crystal' | 'report' | 'service';
  requiresShipping?: boolean;
  active?: boolean;
};

type GeneratedPage = {
  subtitle: string;
  seoTitle: string;
  seoDescription: string;
  sections: Array<Record<string, unknown>>;
  testimonials: Array<{ author: string; rating: number; body: string; sort: number }>;
};

const AUTH_URL = process.env.AUTH_INTERNAL_URL || 'http://127.0.0.1:3101';
const ONLY_MISSING = process.env.ONLY_MISSING === '1';
const SKIP_TESTIMONIALS = process.env.SKIP_TESTIMONIALS === '1';

const AUTHOR_POOL = ['林**', '周**', '陈**', '王**', '李**', '张**', '赵**', '吴**', '郑**', '孙**'];

const CRYSTAL_COPY: Record<string, { story: string; guide: string; quote: string }> = {
  木: {
    story: '绿幽灵与木行能量相呼应，象征生长与丰盈。适合希望拓展事业、增添活力时使用。',
    guide: '木行手串宜佩戴左手，配合清晨或户外活动时佩戴，有助于保持开阔心态。',
    quote: '木行如春风，不急不躁，却能让生活多一点向上的力量。',
  },
  火: {
    story: '红玛瑙色泽温暖，与火行能量相合，有助于提振精神、增强行动力。',
    guide: '火行手串适合在需要勇气或社交场合前佩戴，避免长时间高温暴晒。',
    quote: '一抹暖红，像心底被轻轻点亮的小火苗。',
  },
  土: {
    story: '黄水晶沉稳厚实，土行主守正聚财，适合需要稳定感与落地执行的阶段。',
    guide: '土行手串可日常佩戴，有助于提醒自己脚踏实地、循序渐进。',
    quote: '土行的力量，在于让人心安，也让步伐更稳。',
  },
  金: {
    story: '白水晶纯净通透，金行主决断与清晰，适合思绪纷乱、需要专注的时刻。',
    guide: '金行手串建议左手佩戴，冥想或学习前佩戴尤为适宜。',
    quote: '白水晶像一束温和的光，让心慢慢静下来。',
  },
  水: {
    story: '黑曜石深邃内敛，水行主防护与净化，适合敏感体质或需要边界感的用户。',
    guide: '水行手串可与其他水晶叠戴，睡前取下，让能量在夜间自然恢复。',
    quote: '黑曜石默默守护，像深夜里可靠的朋友。',
  },
};

function hashSku(sku: string): number {
  let h = 0;
  for (let i = 0; i < sku.length; i++) h = (h * 31 + sku.charCodeAt(i)) >>> 0;
  return h;
}

function pickAuthors(sku: string, count: number): string[] {
  const start = hashSku(sku) % AUTHOR_POOL.length;
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(AUTHOR_POOL[(start + i) % AUTHOR_POOL.length]);
  return out;
}

function relatedSkus(product: ProductRow, all: ProductRow[]): string[] {
  const others = all.filter((p) => p.sku !== product.sku && p.active !== false);
  if (product.category === 'crystal') {
    return others
      .filter((p) => p.category === 'crystal')
      .sort((a, b) => hashSku(a.sku + product.sku) - hashSku(b.sku + product.sku))
      .slice(0, 2)
      .map((p) => p.sku);
  }
  if (product.sku.includes('bazi')) {
    return others.filter((p) => p.sku.includes('bazi')).slice(0, 2).map((p) => p.sku);
  }
  if (product.sku.includes('ziwei')) {
    return others.filter((p) => p.sku.includes('ziwei')).slice(0, 2).map((p) => p.sku);
  }
  if (product.sku.includes('tarot')) {
    return others.filter((p) => p.sku.includes('tarot')).slice(0, 2).map((p) => p.sku);
  }
  return others
    .filter((p) => p.category === product.category)
    .slice(0, 2)
    .map((p) => p.sku);
}

function generatePage(product: ProductRow, all: ProductRow[]): GeneratedPage {
  const desc = product.desc || product.description || product.name;
  const shipping = inferRequiresShipping(product);
  const wrist = inferRequiresWristSize(product);
  const related = relatedSkus(product, all);

  if (product.category === 'crystal') {
    const el = product.element || '金';
    const copy = CRYSTAL_COPY[el] || CRYSTAL_COPY['金'];
    return {
      subtitle: `${desc} · 五行${el}`,
      seoTitle: `${product.name} · 五行${el} | OraSage Energy Shop`,
      seoDescription: `${product.name}，${desc}。天然水晶手串，支持手围定制，付款后 3–5 个工作日发货。`,
      sections: [
        { type: 'richText', body: `${copy.story}\n\n${product.name}选用天然石料，珠径约 8mm，手感温润，适合日常通勤与休闲佩戴。` },
        {
          type: 'specList',
          title: '商品规格',
          specItems: [
            { label: '商品名称', value: product.name },
            { label: '五行', value: el },
            { label: '珠径', value: '约 8mm' },
            ...(wrist ? [{ label: '手围', value: '结账时可选择 15–19cm' }] : []),
            { label: '发货方式', value: shipping ? '实体发货，3–5 个工作日' : '数字交付' },
          ],
        },
        { type: 'guide', title: '佩戴建议', body: copy.guide },
        { type: 'quote', quote: copy.quote, attribution: 'OraSage 能量顾问' },
        {
          type: 'faq',
          title: '常见问题',
          faqItems: [
            {
              question: '如何测量手围？',
              answer: '用软尺绕手腕最细处一圈，不加松量；介于两档时建议选大一号。',
            },
            {
              question: '收到后如何保养？',
              answer: '避免磕碰与化学品，可用清水轻冲后阴干，不宜长时间暴晒。',
            },
          ],
        },
        ...(related.length ? [{ type: 'relatedSkus', relatedSkus: related.map((sku) => ({ sku })) }] : []),
      ],
      testimonials: buildCrystalTestimonials(product, el),
    };
  }

  if (product.category === 'report') {
    const isBundle = /advanced|premium|bundle/i.test(product.sku);
    const isCouple = product.sku.includes('couple');
    const delivery = shipping
      ? '含实体商品：报告解锁后按流程发货，物流信息可在订单页查看。'
      : '数字报告：付款成功后自动解锁，登录即可在对应命理 App 中查看。';
    return {
      subtitle: desc,
      seoTitle: `${product.name} | OraSage 数字报告`,
      seoDescription: `${product.name}。${desc}。${delivery}`,
      sections: [
        {
          type: 'richText',
          body: `${product.name}由 OraSage AI 与命理知识库联合生成，结合你的命盘或牌阵信息，提供结构化解读与可执行建议。\n\n${desc}`,
        },
        {
          type: 'specList',
          title: '交付说明',
          specItems: [
            { label: '商品类型', value: '数字报告' + (isBundle ? ' + 实体礼盒/手串' : '') },
            { label: '适用场景', value: isCouple ? '双人合盘' : '个人命盘 / 牌阵解读' },
            { label: '交付方式', value: shipping ? '报告数字交付 + 实体物流' : '登录对应 App 在线查看' },
            { label: '支持语言', value: '简体中文（首期）' },
          ],
        },
        {
          type: 'guide',
          title: '使用指南',
          body: shipping
            ? '完成支付后，报告将在对应 App 内解锁；实体部分将按订单地址发货，请确保收货信息准确。'
            : '完成支付后，前往八字 / 紫微 / 塔罗对应应用，在报告中心或邮件提示入口查看完整内容。',
        },
        {
          type: 'faq',
          title: '常见问题',
          faqItems: [
            {
              question: '报告多久可以查看？',
              answer: '数字报告通常在付款成功后数分钟内可用；高峰时段可能略有延迟。',
            },
            {
              question: '可以退款吗？',
              answer: '数字内容一经解锁原则上不支持退款；实体部分未发货前请联系客服。',
            },
          ],
        },
        ...(related.length ? [{ type: 'relatedSkus', relatedSkus: related.map((sku) => ({ sku })) }] : []),
      ],
      testimonials: buildReportTestimonials(product),
    };
  }

  // service
  const isDonation = product.sku.includes('donation');
  const isChat = product.sku.includes('chat');
  return {
    subtitle: desc,
    seoTitle: `${product.name} | OraSage 能量服务`,
    seoDescription: `${product.name}。${desc}`,
    sections: [
      {
        type: 'richText',
        body: isDonation
          ? `${product.name}用于支持 OraSage 祈福体系的持续运营，包括服务器、内容与体验优化。金额可自愿选择，感谢您的支持。`
          : isChat
            ? `${product.name}为紫微 Orasage 对话增值服务，购买后额度自动充值到账户，可在排盘对话中使用。`
            : `${product.name}提供一对一能量咨询，由命理顾问在线答疑，帮助你理清当下困惑与行动方向。`,
      },
      {
        type: 'specList',
        title: '服务说明',
        specItems: [
          { label: '服务类型', value: isDonation ? '乐捐支持' : isChat ? '对话额度' : '在线咨询' },
          { label: '交付方式', value: '账户权益自动生效，无需物流' },
          { label: '有效期', value: product.sku.includes('yearly') ? '365 天' : isChat ? '永久累积' : '预约时段内' },
        ],
      },
      {
        type: 'faq',
        title: '常见问题',
        faqItems: [
          {
            question: '购买后如何生效？',
            answer: '登录同一 OraSage 账户，权益将自动同步到对应子应用或服务入口。',
          },
          {
            question: '可以转让吗？',
            answer: '账户权益与购买账号绑定，不支持转让或折现。',
          },
        ],
      },
      ...(related.length ? [{ type: 'relatedSkus', relatedSkus: related.map((sku) => ({ sku })) }] : []),
    ],
    testimonials: buildServiceTestimonials(product),
  };
}

function buildCrystalTestimonials(product: ProductRow, element: string) {
  const [a, b] = pickAuthors(product.sku, 2);
  return [
    {
      author: a,
      rating: 5,
      body: `${product.name}质感很好，${element}行能量听着很贴我，戴着心里踏实。`,
      sort: 10,
    },
    {
      author: b,
      rating: 4,
      body: '包装精美，物流也快。珠子比想象中有分量，日常搭配好看。',
      sort: 20,
    },
  ];
}

function buildReportTestimonials(product: ProductRow) {
  const [a, b] = pickAuthors(product.sku, 2);
  const app = product.sku.includes('ziwei')
    ? '紫微'
    : product.sku.includes('tarot')
      ? '塔罗'
      : '八字';
  return [
    {
      author: a,
      rating: 5,
      body: `报告结构清晰，${app}解读部分很有启发，比免费简读详细很多。`,
      sort: 10,
    },
    {
      author: b,
      rating: 5,
      body: '付款后很快就解锁了，手机上查看方便，值得入手。',
      sort: 20,
    },
  ];
}

function buildServiceTestimonials(product: ProductRow) {
  const [a] = pickAuthors(product.sku, 1);
  if (product.sku.includes('donation')) {
    return [
      {
        author: a,
        rating: 5,
        body: '祈福体验很好，乐捐也是支持平台持续运营，愿大家都平安。',
        sort: 10,
      },
    ];
  }
  const [b] = pickAuthors(product.sku + 'b', 1);
  return [
    {
      author: a,
      rating: 5,
      body: product.sku.includes('chat')
        ? '加量包很实惠，对话次数到账及时，排盘追问方便多了。'
        : '咨询师很耐心，半小时里把问题梳理得很清楚。',
      sort: 10,
    },
    {
      author: b,
      rating: 4,
      body: '购买流程顺畅，账户里立刻能看到权益，体验不错。',
      sort: 20,
    },
  ];
}

async function fetchProducts(): Promise<ProductRow[]> {
  const res = await fetch(`${AUTH_URL}/api/products?locale=zh-CN`);
  if (!res.ok) throw new Error(`auth products ${res.status}`);
  const data = (await res.json()) as { products: ProductRow[] };
  return (data.products ?? []).filter((p) => p.active !== false);
}

async function fetchSkuThumbMap(payload: Awaited<ReturnType<typeof getPayload>>) {
  const map = new Map<string, number>();
  const rows = await payload.find({ collection: 'shop-product-images', limit: 500, depth: 1 });
  for (const row of rows.docs) {
    const sku = row.sku as string | undefined;
    const image = row.image;
    const id = typeof image === 'object' && image && 'id' in image ? (image.id as number) : image;
    if (sku && typeof id === 'number') map.set(sku, id);
  }
  return map;
}

async function pickHeroImages(
  payload: Awaited<ReturnType<typeof getPayload>>,
  sku: string,
  name: string,
  thumbMap: Map<string, number>,
  mediaPool: number[],
) {
  const ids: number[] = [];
  const thumb = thumbMap.get(sku);
  if (thumb) ids.push(thumb);

  const offset = hashSku(sku) % Math.max(mediaPool.length, 1);
  for (let i = 0; ids.length < 3 && i < mediaPool.length; i++) {
    const id = mediaPool[(offset + i) % mediaPool.length];
    if (!ids.includes(id)) ids.push(id);
  }

  return ids.map((imageId, index) => ({
    image: imageId,
    alt: index === 0 ? `${name}主图` : `${name}展示 ${index + 1}`,
    sort: index * 10,
  }));
}

async function upsertPage(
  payload: Awaited<ReturnType<typeof getPayload>>,
  sku: string,
  data: Record<string, unknown>,
) {
  const existing = await payload.find({
    collection: 'shop-product-pages',
    where: { and: [{ sku: { equals: sku } }, { locale: { equals: 'zh-CN' } }] },
    limit: 1,
  });
  if (existing.docs[0]) {
    await payload.update({ collection: 'shop-product-pages', id: existing.docs[0].id, data });
    return 'updated';
  }
  await payload.create({ collection: 'shop-product-pages', data });
  return 'created';
}

async function upsertTestimonials(
  payload: Awaited<ReturnType<typeof getPayload>>,
  sku: string,
  items: GeneratedPage['testimonials'],
) {
  for (const t of items) {
    const existing = await payload.find({
      collection: 'shop-product-testimonials',
      where: {
        and: [
          { sku: { equals: sku } },
          { author: { equals: t.author } },
          { locale: { equals: 'zh-CN' } },
        ],
      },
      limit: 1,
    });
    const data = {
      sku,
      author: t.author,
      rating: t.rating,
      body: t.body,
      locale: 'zh-CN' as const,
      sort: t.sort,
      enabled: true,
    };
    if (existing.docs[0]) {
      await payload.update({ collection: 'shop-product-testimonials', id: existing.docs[0].id, data });
    } else {
      await payload.create({ collection: 'shop-product-testimonials', data });
    }
  }
}

async function main() {
  const payload = await getPayload({ config });
  const products = await fetchProducts();
  if (!products.length) {
    console.error('[seed-shop-pages-all] 无商品数据');
    process.exit(1);
  }

  const thumbMap = await fetchSkuThumbMap(payload);
  const media = await payload.find({ collection: 'media', limit: 30, sort: '-createdAt' });
  const mediaPool = media.docs.map((d) => d.id as number).filter(Boolean);
  if (!mediaPool.length) {
    console.error('[seed-shop-pages-all] 媒体库为空');
    process.exit(1);
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    if (ONLY_MISSING) {
      const exists = await payload.find({
        collection: 'shop-product-pages',
        where: { and: [{ sku: { equals: product.sku } }, { locale: { equals: 'zh-CN' } }] },
        limit: 1,
      });
      if (exists.docs[0]) {
        skipped++;
        console.log(`[seed-shop-pages-all] skip ${product.sku} (exists)`);
        continue;
      }
    }

    const generated = generatePage(product, products);
    const heroImages = await pickHeroImages(
      payload,
      product.sku,
      product.name,
      thumbMap,
      mediaPool,
    );

    const pageData = {
      sku: product.sku,
      locale: 'zh-CN' as const,
      status: 'published' as const,
      subtitle: generated.subtitle,
      seoTitle: generated.seoTitle,
      seoDescription: generated.seoDescription,
      heroImages,
      sections: generated.sections,
    };

    const action = await upsertPage(payload, product.sku, pageData);
    if (action === 'created') created++;
    else updated++;

    if (!SKIP_TESTIMONIALS) {
      await upsertTestimonials(payload, product.sku, generated.testimonials);
    }

    console.log(`[seed-shop-pages-all] ${action} ${product.sku} — ${product.name}`);
  }

  console.log(
    `[seed-shop-pages-all] done: ${products.length} products, created=${created}, updated=${updated}, skipped=${skipped}`,
  );
}

main().catch((err) => {
  console.error('[seed-shop-pages-all]', err);
  process.exit(1);
});
