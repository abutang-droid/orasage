import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "shop_product_images" (
    "id" serial PRIMARY KEY NOT NULL,
    "sku" varchar NOT NULL,
    "image_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "shop_product_images_sku_idx" ON "shop_product_images" ("sku");

  DO $$ BEGIN
    ALTER TABLE "shop_product_images"
      ADD CONSTRAINT "shop_product_images_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "shop_product_images_id" integer;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_shop_product_images_fk"
      FOREIGN KEY ("shop_product_images_id") REFERENCES "public"."shop_product_images"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_shop_product_images_id_idx"
    ON "payload_locked_documents_rels" USING btree ("shop_product_images_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_shop_product_images_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "shop_product_images_id";
    DROP TABLE IF EXISTS "shop_product_images" CASCADE;
  `);
}
