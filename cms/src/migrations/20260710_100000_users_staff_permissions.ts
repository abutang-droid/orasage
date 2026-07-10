import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/** 7a CMS SSO：users.staff_permissions 供运营权限点校验 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "staff_permissions" jsonb;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" DROP COLUMN IF EXISTS "staff_permissions";
  `);
}
