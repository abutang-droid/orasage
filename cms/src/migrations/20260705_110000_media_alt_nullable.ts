import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres';

/** Hero 图片上传可不填 alt；初始迁移误设为 NOT NULL 导致上传失败 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media" ALTER COLUMN "alt" DROP NOT NULL;
    UPDATE "media" SET "alt" = '' WHERE "alt" IS NULL;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "media" SET "alt" = '' WHERE "alt" IS NULL;
    ALTER TABLE "media" ALTER COLUMN "alt" SET NOT NULL;
  `);
}
