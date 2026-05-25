-- AlterTable
ALTER TABLE "orders" ADD COLUMN "merchant_reference" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "orders_merchant_reference_key" ON "orders"("merchant_reference");
