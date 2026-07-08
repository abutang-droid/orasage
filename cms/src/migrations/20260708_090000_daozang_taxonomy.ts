import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_daozang_category" AS ENUM(
        'quanfa', 'zhongyi', 'bazi', 'ziweidoushu', 'qizhengsheyu',
        'yijing', 'liuyao', 'meihuayishu', 'qimendunjia', 'daliuren',
        'dixiang', 'renxiang', 'xingxiang'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "daozang_category" "enum_pages_daozang_category";
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "sort_weight" numeric;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "excerpt" text;
    CREATE INDEX IF NOT EXISTS "pages_daozang_category_idx" ON "pages" ("daozang_category");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "pages_daozang_category_idx";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "daozang_category";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "sort_weight";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "excerpt";
    DROP TYPE IF EXISTS "public"."enum_pages_daozang_category";
  `);
}
