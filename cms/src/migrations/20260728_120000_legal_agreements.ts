import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/** 全站法律协议集合（隐私 / 服务 / 商品服务，多语言） */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_legal_agreements_kind" AS ENUM('privacy', 'service', 'product');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_legal_agreements_locale" AS ENUM('zh-CN', 'zh-TW', 'en', 'pt-BR');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_legal_agreements_status" AS ENUM('draft', 'published');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE TABLE IF NOT EXISTS "legal_agreements" (
    "id" serial PRIMARY KEY NOT NULL,
    "kind" "enum_legal_agreements_kind" NOT NULL,
    "locale" "enum_legal_agreements_locale" DEFAULT 'zh-CN' NOT NULL,
    "status" "enum_legal_agreements_status" DEFAULT 'draft' NOT NULL,
    "version" varchar DEFAULT '2026.07' NOT NULL,
    "title" varchar NOT NULL,
    "summary" varchar,
    "body_html" varchar NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "legal_agreements_kind_locale_idx"
    ON "legal_agreements" ("kind", "locale");
  CREATE INDEX IF NOT EXISTS "legal_agreements_kind_idx" ON "legal_agreements" ("kind");
  CREATE INDEX IF NOT EXISTS "legal_agreements_updated_at_idx" ON "legal_agreements" ("updated_at");
  CREATE INDEX IF NOT EXISTS "legal_agreements_created_at_idx" ON "legal_agreements" ("created_at");

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
  DROP TABLE IF EXISTS "legal_agreements";
  DROP TYPE IF EXISTS "public"."enum_legal_agreements_status";
  DROP TYPE IF EXISTS "public"."enum_legal_agreements_locale";
  DROP TYPE IF EXISTS "public"."enum_legal_agreements_kind";
  `);
}
