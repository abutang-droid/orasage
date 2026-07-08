import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/** 道藏分类补充：三命通会/渊海子平/神峰通考/星命总括 四部全书（章节文档） */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const value of ['sanmingtonghui', 'yuanhaiziping', 'shenfengtongkao', 'xingmingzongkuo']) {
    await db.execute(sql`
      DO $$ BEGIN
        ALTER TYPE "public"."enum_pages_daozang_category" ADD VALUE IF NOT EXISTS '${sql.raw(value)}';
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // PostgreSQL does not support removing enum values safely; no-op.
  await db.execute(sql`SELECT 1`);
}
