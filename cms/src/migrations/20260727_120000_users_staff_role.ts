import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/** Phase C：同步 JWT role，供 Payload Admin UI access.admin 门闩（仅 admin） */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "staff_role" varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" DROP COLUMN IF EXISTS "staff_role";
  `);
}
