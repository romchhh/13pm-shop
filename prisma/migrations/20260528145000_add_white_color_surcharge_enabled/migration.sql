ALTER TABLE "products"
ADD COLUMN IF NOT EXISTS "white_color_surcharge_enabled" BOOLEAN NOT NULL DEFAULT true;
