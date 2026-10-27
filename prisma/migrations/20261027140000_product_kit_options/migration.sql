-- Комплекти: галочка + розміри/ціни верху та низу
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_kit" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "kit_options" JSONB;
