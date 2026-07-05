import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/** payload_locked_documents_rels 需为 tarot-home-hero global 增加外键列 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "tarot_home_hero_id" integer;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_tarot_home_hero_fk"
      FOREIGN KEY ("tarot_home_hero_id") REFERENCES "public"."tarot_home_hero"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_tarot_home_hero_id_idx"
    ON "payload_locked_documents_rels" USING btree ("tarot_home_hero_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_tarot_home_hero_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "tarot_home_hero_id";
  `);
}
