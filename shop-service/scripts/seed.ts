import { db, initDb, pool } from '../src/lib/db';
import { products } from '../src/lib/schema';

const SEED_PRODUCTS = [
  {
    slug: 'bazi-full-report',
    name: '八字详批报告',
    description: '基于出生信息的完整八字命盘解读，含大运流年分析。',
    priceCents: 2999,
    type: 'digital' as const,
    appSource: 'bazi' as const,
    sortOrder: 10,
    metadata: { feature: 'full_report', durationDays: 365 },
  },
  {
    slug: 'bazi-annual-forecast',
    name: '八字流年运势',
    description: '当年流年运势专项报告，事业财运感情健康四维分析。',
    priceCents: 999,
    type: 'digital' as const,
    appSource: 'bazi' as const,
    sortOrder: 20,
    metadata: { feature: 'annual_forecast' },
  },
  {
    slug: 'ziwei-chart-premium',
    name: '紫微斗数命盘',
    description: '完整紫微命盘排盘与十二宫详解，含三方四正分析。',
    priceCents: 3999,
    type: 'digital' as const,
    appSource: 'ziwei' as const,
    sortOrder: 30,
    metadata: { feature: 'premium_chart' },
  },
  {
    slug: 'tarot-deep-reading',
    name: '塔罗深度解读',
    description: '三张牌深度解读套餐，附个性化建议与行动指引。',
    priceCents: 599,
    type: 'digital' as const,
    appSource: 'tarot' as const,
    sortOrder: 40,
    metadata: { feature: 'deep_reading', cards: 3 },
  },
  {
    slug: 'orasage-vip-monthly',
    name: 'OraSage VIP 月卡',
    description: '全平台命理 App 高级功能月卡，含优先客服与专属内容。',
    priceCents: 1999,
    type: 'subscription' as const,
    appSource: 'shop' as const,
    sortOrder: 50,
    metadata: { feature: 'vip', period: 'monthly' },
  },
  {
    slug: 'orasage-vip-yearly',
    name: 'OraSage VIP 年卡',
    description: '全平台 VIP 年卡，比月卡节省 40%。',
    priceCents: 14999,
    type: 'subscription' as const,
    appSource: 'shop' as const,
    sortOrder: 60,
    metadata: { feature: 'vip', period: 'yearly' },
  },
];

async function seed() {
  await initDb();

  for (const p of SEED_PRODUCTS) {
    await db
      .insert(products)
      .values(p)
      .onConflictDoNothing({ target: products.slug });
  }

  console.log(`seeded ${SEED_PRODUCTS.length} products`);
  await pool.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
