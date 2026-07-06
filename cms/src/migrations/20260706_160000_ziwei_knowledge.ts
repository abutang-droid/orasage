import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/** 紫微知识库：古籍书目、章节、主星百科、合盘夫妻宫断语 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_ziwei_classics_books_wp_status" AS ENUM('publish', 'draft');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_ziwei_classics_chapters_wp_status" AS ENUM('publish', 'draft');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_ziwei_knowledge_stars_wp_status" AS ENUM('publish', 'draft');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_ziwei_heming_stars_wp_status" AS ENUM('publish', 'draft');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE TABLE IF NOT EXISTS "ziwei_classics_books" (
    "id" serial PRIMARY KEY NOT NULL,
    "code" varchar NOT NULL,
    "title" varchar NOT NULL,
    "dynasty" varchar,
    "author" varchar,
    "intro" varchar,
    "word_count" numeric,
    "sort_order" numeric DEFAULT 0,
    "wp_status" "enum_ziwei_classics_books_wp_status" DEFAULT 'publish',
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "ziwei_classics_chapters" (
    "id" serial PRIMARY KEY NOT NULL,
    "code" varchar NOT NULL,
    "book_id" integer NOT NULL,
    "chapter_index" numeric DEFAULT 0 NOT NULL,
    "title" varchar NOT NULL,
    "subtitle" varchar,
    "paragraphs" jsonb NOT NULL,
    "wp_status" "enum_ziwei_classics_chapters_wp_status" DEFAULT 'publish',
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "ziwei_knowledge_stars" (
    "id" serial PRIMARY KEY NOT NULL,
    "code" varchar NOT NULL,
    "star_name" varchar NOT NULL,
    "brief" varchar NOT NULL,
    "keywords" varchar,
    "nature" varchar,
    "element" varchar,
    "sort_order" numeric DEFAULT 0,
    "wp_status" "enum_ziwei_knowledge_stars_wp_status" DEFAULT 'publish',
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "ziwei_heming_stars" (
    "id" serial PRIMARY KEY NOT NULL,
    "code" varchar NOT NULL,
    "star_name" varchar NOT NULL,
    "summary" varchar NOT NULL,
    "good" varchar,
    "bad" varchar,
    "spouse_traits" varchar,
    "timing" varchar,
    "ni_quote" varchar,
    "wp_status" "enum_ziwei_heming_stars_wp_status" DEFAULT 'publish',
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  DO $$ BEGIN
    ALTER TABLE "ziwei_classics_chapters"
      ADD CONSTRAINT "ziwei_classics_chapters_book_id_ziwei_classics_books_id_fk"
      FOREIGN KEY ("book_id") REFERENCES "public"."ziwei_classics_books"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE UNIQUE INDEX IF NOT EXISTS "ziwei_classics_books_code_idx" ON "ziwei_classics_books" USING btree ("code");
  CREATE UNIQUE INDEX IF NOT EXISTS "ziwei_classics_chapters_code_idx" ON "ziwei_classics_chapters" USING btree ("code");
  CREATE INDEX IF NOT EXISTS "ziwei_classics_chapters_book_idx" ON "ziwei_classics_chapters" USING btree ("book_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "ziwei_knowledge_stars_code_idx" ON "ziwei_knowledge_stars" USING btree ("code");
  CREATE UNIQUE INDEX IF NOT EXISTS "ziwei_heming_stars_code_idx" ON "ziwei_heming_stars" USING btree ("code");

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "ziwei_classics_books_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "ziwei_classics_chapters_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "ziwei_knowledge_stars_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "ziwei_heming_stars_id" integer;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_ziwei_classics_books_fk"
      FOREIGN KEY ("ziwei_classics_books_id") REFERENCES "public"."ziwei_classics_books"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_ziwei_classics_chapters_fk"
      FOREIGN KEY ("ziwei_classics_chapters_id") REFERENCES "public"."ziwei_classics_chapters"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_ziwei_knowledge_stars_fk"
      FOREIGN KEY ("ziwei_knowledge_stars_id") REFERENCES "public"."ziwei_knowledge_stars"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_ziwei_heming_stars_fk"
      FOREIGN KEY ("ziwei_heming_stars_id") REFERENCES "public"."ziwei_heming_stars"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_ziwei_classics_books_id_idx"
    ON "payload_locked_documents_rels" USING btree ("ziwei_classics_books_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_ziwei_classics_chapters_id_idx"
    ON "payload_locked_documents_rels" USING btree ("ziwei_classics_chapters_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_ziwei_knowledge_stars_id_idx"
    ON "payload_locked_documents_rels" USING btree ("ziwei_knowledge_stars_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_ziwei_heming_stars_id_idx"
    ON "payload_locked_documents_rels" USING btree ("ziwei_heming_stars_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_ziwei_classics_books_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_ziwei_classics_chapters_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_ziwei_knowledge_stars_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_ziwei_heming_stars_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "ziwei_classics_books_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "ziwei_classics_chapters_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "ziwei_knowledge_stars_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "ziwei_heming_stars_id";
    DROP TABLE IF EXISTS "ziwei_classics_chapters" CASCADE;
    DROP TABLE IF EXISTS "ziwei_classics_books" CASCADE;
    DROP TABLE IF EXISTS "ziwei_knowledge_stars" CASCADE;
    DROP TABLE IF EXISTS "ziwei_heming_stars" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_ziwei_classics_books_wp_status";
    DROP TYPE IF EXISTS "public"."enum_ziwei_classics_chapters_wp_status";
    DROP TYPE IF EXISTS "public"."enum_ziwei_knowledge_stars_wp_status";
    DROP TYPE IF EXISTS "public"."enum_ziwei_heming_stars_wp_status";
  `);
}
