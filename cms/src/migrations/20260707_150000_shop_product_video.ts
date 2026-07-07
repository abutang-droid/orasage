import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/** 商品详情页：主图视频 + 场景视频 URL 字段 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "shop_product_pages" ADD COLUMN IF NOT EXISTS "gallery_video_url" varchar;
  ALTER TABLE "shop_product_pages" ADD COLUMN IF NOT EXISTS "scene_video_url" varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "shop_product_pages" DROP COLUMN IF EXISTS "gallery_video_url";
  ALTER TABLE "shop_product_pages" DROP COLUMN IF EXISTS "scene_video_url";
  `);
}
