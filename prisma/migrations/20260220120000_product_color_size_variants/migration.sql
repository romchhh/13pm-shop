-- AlterTable
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "color_options" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "size_variants" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_new" BOOLEAN NOT NULL DEFAULT false;
