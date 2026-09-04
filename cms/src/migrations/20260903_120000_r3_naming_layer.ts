import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

function esc(value: string): string {
  return value.replace(/'/g, "''");
}

/** R3 naming layer: crystal PDP titles/descriptions drop 能量/Energy and outcome claims. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  const pages: Array<{
    sku: string;
    locale: 'zh-CN' | 'en' | 'pt-BR';
    title: string;
    description: string;
    subtitle?: string;
  }> = [
    {
      sku: 'crystal-wood',
      locale: 'zh-CN',
      title: '生长之境 · 绿幽灵手串 · OraSage Crystal Shop',
      description:
        "生长之境 · 绿幽灵手串：8mm 绿幽灵圆珠，蜡线手工打结，15-18cm 可调手围。OraSage 设计师手作，五行属木，作为'生长'的日常提醒。文化意象，非疗效承诺。",
      subtitle: '戴上，听见生发的信号。',
    },
    {
      sku: 'crystal-wood',
      locale: 'en',
      title: 'Realm of Growth · Green Phantom Quartz Bracelet · OraSage Crystal Shop',
      description:
        'Realm of Growth · Green Phantom Quartz Bracelet: 8mm beads, hand-knotted waxed cord, 15–18cm adjustable. A daily growth reminder. Cultural symbol, not a health claim.',
    },
    {
      sku: 'crystal-fire',
      locale: 'zh-CN',
      title: '焰心觉醒 · 红玛瑙手串 · OraSage Crystal Shop',
      description:
        "焰心觉醒 · 红玛瑙手串：8mm 红玛瑙圆珠，蜡线手工打结，15-18cm 可调手围。OraSage 设计师手作，五行属火，作为'行动'的日常提醒。文化意象，非疗效承诺。",
      subtitle: '戴上，听见行动前的温煦。',
    },
    {
      sku: 'crystal-fire',
      locale: 'en',
      title: 'Awakening of the Inner Flame · Red Agate Bracelet · OraSage Crystal Shop',
      description:
        'Awakening of the Inner Flame · Red Agate Bracelet: 8mm beads, hand-knotted waxed cord, 15–18cm adjustable. A daily action reminder. Cultural symbol, not a health claim.',
    },
    {
      sku: 'crystal-earth',
      locale: 'zh-CN',
      title: '厚土之根 · 黄水晶手串 · OraSage Crystal Shop',
      description:
        "厚土之根 · 黄水晶手串：8mm 黄水晶圆珠，蜡线手工打结，15-18cm 可调手围。OraSage 设计师手作，五行属土，作为'守成'的日常提醒。文化意象，非疗效承诺。",
      subtitle: '戴上，承接一段长久的守成。',
    },
    {
      sku: 'crystal-earth',
      locale: 'en',
      title: 'Roots of the Fertile Earth · Citrine Bracelet · OraSage Crystal Shop',
      description:
        'Roots of the Fertile Earth · Citrine Bracelet: 8mm beads, hand-knotted waxed cord, 15–18cm adjustable. A daily steadfast reminder. Cultural symbol, not a health claim.',
    },
    {
      sku: 'crystal-metal',
      locale: 'zh-CN',
      title: '澄明之境 · 白水晶手串 · OraSage Crystal Shop',
      description:
        "澄明之境 · 白水晶手串：8mm 白水晶圆珠，蜡线手工打结，15-18cm 可调手围。OraSage 设计师手作，五行属金，作为'静定'的日常提醒。文化意象，非疗效承诺。",
      subtitle: '戴上，把喧嚣收敛为静定。',
    },
    {
      sku: 'crystal-metal',
      locale: 'en',
      title: 'Realm of Clarity – Clear Quartz Bracelet · OraSage Crystal Shop',
      description:
        'Realm of Clarity – Clear Quartz Bracelet: 8mm beads, hand-knotted waxed cord, 15–18cm adjustable. A daily stillness reminder. Cultural symbol, not a health claim.',
    },
    {
      sku: 'crystal-water',
      locale: 'zh-CN',
      title: '深海静盾 · 黑曜石手串 · OraSage Crystal Shop',
      description:
        "深海静盾 · 黑曜石手串：8mm 黑曜石圆珠，蜡线手工打结，15-18cm 可调手围。OraSage 设计师手作，五行属水，作为'边界'的日常提醒。文化意象，非疗效承诺。",
      subtitle: '戴上，在深与浅之间划一条边界。',
    },
    {
      sku: 'crystal-water',
      locale: 'en',
      title: 'Deep-Sea Silent Shield · Obsidian Bracelet · OraSage Crystal Shop',
      description:
        'Deep-Sea Silent Shield · Obsidian Bracelet: 8mm beads, hand-knotted waxed cord, 15–18cm adjustable. A daily boundary reminder. Cultural symbol, not a health claim.',
    },
  ];

  for (const page of pages) {
    const subtitleSql = page.subtitle
      ? `, subtitle = '${esc(page.subtitle)}'`
      : '';
    await db.execute(sql.raw(`
      UPDATE shop_product_pages
      SET seo_title = '${esc(page.title)}',
          seo_description = '${esc(page.description)}'${subtitleSql},
          updated_at = now()
      WHERE sku = '${esc(page.sku)}'
        AND locale = '${esc(page.locale)}';
    `));
  }

  await db.execute(sql`
    UPDATE shop_product_pages
    SET seo_title = REPLACE(REPLACE(COALESCE(seo_title, ''),
          '能量手串', '手串'),
          'Energy Bracelet', 'Bracelet'),
        seo_description = REPLACE(REPLACE(COALESCE(seo_description, ''),
          '能量手串', '手串'),
          'Energy Bracelet', 'Bracelet'),
        updated_at = now()
    WHERE sku LIKE 'crystal-%';
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`SELECT 1`);
}
