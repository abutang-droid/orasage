import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/**
 * P0 A1: sanitize crystal PDP CMS copy (story / richText / faq / specList).
 * Idempotent REPLACE on zh-CN crystal pages; guide sections use p0-rewrite-pdp-guides.sh.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- section bodies (richText, guide, quote)
    UPDATE shop_product_pages_sections s
    SET body = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        COALESCE(s.body, ''),
        '能量手串', '五行水晶手串'),
        '能量搭配推荐', '搭配建议'),
        '能量预处理', '开箱检查'),
        '能量使用指南', '佩戴指南卡片'),
        '能量之石', '文化象征'),
        '财富之石', '生长象征'),
        '商人之石', '土行象征'),
        '万能放大器', '百搭基础款'),
        '效果 ×2', '组合佩戴'),
        '定向放大', '组合佩戴'),
        '脉轮', '传统象征'),
        '消磁', '保养'),
        '净化仪式', '开箱整理'),
        '净化', '清洁'),
        '负能量', '外界干扰'),
        '招财', '文化意象'),
        'OraSage Energy Shop', 'OraSage Crystal Shop'),
        '能量商城', '水晶商城'),
        '能量法器', '文化饰品'),
        '能量礼盒', '礼盒套装'),
        '能量详', '五行详')
    FROM shop_product_pages p
    WHERE s._parent_id = p.id
      AND p.locale = 'zh-CN'
      AND p.sku LIKE 'crystal-%';

    UPDATE shop_product_pages_sections s
    SET quote = REPLACE(REPLACE(COALESCE(s.quote, ''),
      '能量', '五行'),
      '显化', '仪式')
    FROM shop_product_pages p
    WHERE s._parent_id = p.id
      AND p.locale = 'zh-CN'
      AND p.sku LIKE 'crystal-%'
      AND s.type = 'quote';

    UPDATE shop_product_pages_sections s
    SET title = REPLACE(COALESCE(s.title, ''), '能量', '五行')
    FROM shop_product_pages p
    WHERE s._parent_id = p.id
      AND p.locale = 'zh-CN'
      AND p.sku LIKE 'crystal-%';

    -- spec items
    UPDATE shop_product_pages_sections_spec_items si
    SET value = REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(si.value, ''),
      '能量预处理', '开箱检查'),
      '净化仪式', '开箱整理'),
      '能量使用指南', '佩戴指南卡片'),
      '月光照射 + 鼠尾草烟熏', '软布擦拭与静置')
    FROM shop_product_pages_sections s
    JOIN shop_product_pages p ON s._parent_id = p.id
    WHERE si._parent_id = s.id
      AND p.locale = 'zh-CN'
      AND p.sku LIKE 'crystal-%';

    -- FAQ answers
    UPDATE shop_product_pages_sections_faq_items fi
    SET answer = REPLACE(REPLACE(REPLACE(COALESCE(fi.answer, ''),
      '消磁', '保养'),
      '能量沉闷', '佩戴感变化'),
      '月光下静置一晚', '软布擦拭后静置')
    FROM shop_product_pages_sections s
    JOIN shop_product_pages p ON s._parent_id = p.id
    WHERE fi._parent_id = s.id
      AND p.locale = 'zh-CN'
      AND p.sku LIKE 'crystal-%';

    UPDATE shop_product_pages_sections_faq_items fi
    SET question = REPLACE(COALESCE(fi.question, ''), '消磁', '保养')
    FROM shop_product_pages_sections s
    JOIN shop_product_pages p ON s._parent_id = p.id
    WHERE fi._parent_id = s.id
      AND p.locale = 'zh-CN'
      AND p.sku LIKE 'crystal-%';

    -- page-level SEO
    UPDATE shop_product_pages
    SET seo_title = REPLACE(COALESCE(seo_title, ''), 'Energy Shop', 'Crystal Shop'),
        seo_description = REPLACE(REPLACE(COALESCE(seo_description, ''),
          '能量手串', '五行水晶手串'),
          '能量', '五行'),
        updated_at = now()
    WHERE locale = 'zh-CN'
      AND sku LIKE 'crystal-%';
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Non-reversible content sanitization — no-op rollback.
  await db.execute(sql`SELECT 1`);
}
