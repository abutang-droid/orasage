import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/**
 * 补齐 legal-agreements 在 payload_locked_documents_rels 的外键列。
 * 首版 20260728_120000 遗漏，登录后清理锁定文档会因缺列失败。
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "legal_agreements_id" integer;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_legal_agreements_fk"
      FOREIGN KEY ("legal_agreements_id") REFERENCES "public"."legal_agreements"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_legal_agreements_id_idx"
    ON "payload_locked_documents_rels" USING btree ("legal_agreements_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_legal_agreements_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "legal_agreements_id";
  `);
}
