import type { CatalogProductCardItem } from "@/components/catalog/CatalogProductCard";

type AddItemFn = (item: {
  id: number;
  name: string;
  price: number;
  size: string;
  quantity: number;
  imageUrl: string;
  discount_percentage?: number;
  category_name?: string | null;
  subtitle?: string;
}) => Promise<void>;

export async function addProductCardToCart(
  addItem: AddItemFn,
  product: CatalogProductCardItem
): Promise<{ ok: true } | { ok: false; message: string }> {
  const firstMediaUrl =
    product.first_media && "url" in product.first_media
      ? product.first_media.url
      : "";
  try {
    await addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      size: "—",
      quantity: 1,
      imageUrl: firstMediaUrl,
      discount_percentage: product.discount_percentage ?? undefined,
      category_name: product.category_name ?? null,
      subtitle: product.subtitle ?? undefined,
    });
    return { ok: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Недостатньо товару в наявності";
    return { ok: false, message };
  }
}
