import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/** 商品详情页/精选评价 locale 枚举扩 4 语（zh-TW/en/pt-BR） */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TYPE "enum_shop_product_pages_locale" ADD VALUE IF NOT EXISTS 'zh-TW';
  ALTER TYPE "enum_shop_product_pages_locale" ADD VALUE IF NOT EXISTS 'en';
  ALTER TYPE "enum_shop_product_pages_locale" ADD VALUE IF NOT EXISTS 'pt-BR';
  ALTER TYPE "enum_shop_product_testimonials_locale" ADD VALUE IF NOT EXISTS 'zh-TW';
  ALTER TYPE "enum_shop_product_testimonials_locale" ADD VALUE IF NOT EXISTS 'en';
  ALTER TYPE "enum_shop_product_testimonials_locale" ADD VALUE IF NOT EXISTS 'pt-BR';
  `);
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Postgres 不支持从枚举移除值；down 为 no-op
}
