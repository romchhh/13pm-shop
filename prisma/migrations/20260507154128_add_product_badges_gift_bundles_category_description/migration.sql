-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "bought_together_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "dietitian_approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gift_product_id" INTEGER,
ADD COLUMN     "is_hit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_promo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pair_together_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_gift_product_id_fkey" FOREIGN KEY ("gift_product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
