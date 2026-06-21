-- Артикул товару (SKU)
ALTER TABLE "products" ADD COLUMN "article" TEXT;

CREATE UNIQUE INDEX "products_article_key" ON "products"("article");
