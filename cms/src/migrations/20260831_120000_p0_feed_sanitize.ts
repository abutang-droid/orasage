import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/** P0 A3: replace outcome-promise feed copy seeded in CMS (doc 26). */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "bazi_feed"
    SET "message" = '「界面清爽，排盘速度快」— 来自上海的用户',
        "updated_at" = now()
    WHERE "message" LIKE '%解读很准%';

    UPDATE "bazi_feed"
    SET "message" = '「喜欢这种东方式的呈现方式」— 来自广州的用户',
        "updated_at" = now()
    WHERE "message" LIKE '%选对了水晶%';

    UPDATE "ziwei_feed"
    SET "message" = '「界面简洁，排盘速度快」— 来自上海的用户',
        "updated_at" = now()
    WHERE "message" LIKE '%命宫解读很准%';

    UPDATE "ziwei_feed"
    SET "message" = '「喜欢这种东方式的呈现方式」— 来自广州的用户',
        "updated_at" = now()
    WHERE "message" LIKE '%合盘分析也很细致%';
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "bazi_feed"
    SET "message" = '「解读很准，五行分析帮我选对了水晶」— 来自上海的用户',
        "updated_at" = now()
    WHERE "message" = '「界面清爽，排盘速度快」— 来自上海的用户';

    UPDATE "ziwei_feed"
    SET "message" = '「命宫解读很准，合盘分析也很细致」— 来自上海的用户',
        "updated_at" = now()
    WHERE "message" = '「界面简洁，排盘速度快」— 来自上海的用户';
  `);
}
