import { VIRTUAL_STOCK_WHEN_IN_STOCK } from "@/lib/productAvailability";
import {
  parseColorOptions,
  parseSizeStock,
  serializeColorOptions,
  serializeSizeStock,
  sortSizeStockRows,
  totalStockFromSizeRows,
  type ProductColorOption,
  type ProductSizeStock,
} from "@/lib/productOptions";

export type ApparelProductFormValues = {
  name: string;
  shortDescription: string;
  description: string;
  price: string;
  oldPrice: string;
  discountPercentage: string;
  priority: string;
  color: ProductColorOption;
  colorLinkedIds: number[];
  boughtTogetherIds: number[];
  sizeRows: ProductSizeStock[];
  inStock: boolean;
  isNew: boolean;
  isHit: boolean;
  categoryIds: number[];
  subcategoryIds: number[];
};

export type ApparelProductApiBody = {
  name: string;
  short_description: string | null;
  description: string | null;
  price: number;
  old_price: number | null;
  discount_percentage: number | null;
  priority: number;
  stock: number;
  in_stock: boolean;
  is_hit: boolean;
  is_new: boolean;
  top_sale: boolean;
  limited_edition: boolean;
  is_promo: boolean;
  dietitian_approved: boolean;
  free_delivery_badge: boolean;
  gift_product_id: null;
  bought_together_ids: number[];
  pair_together_ids: number[];
  color_options: unknown;
  white_color_surcharge_enabled: boolean;
  size_variants: unknown;
  subtitle: null;
  category_id: number | null;
  subcategory_id: number | null;
  category_ids: number[];
  subcategory_ids: number[];
  media: { type: "photo" | "video"; url: string }[];
};

export function defaultApparelColor(): ProductColorOption {
  return { hex: "#1a1a1a", name: "Чорний" };
}

export function defaultApparelSizeRows(): ProductSizeStock[] {
  return [
    { label: "S", stock: 0 },
    { label: "M", stock: 0 },
    { label: "L", stock: 0 },
    { label: "XL", stock: 0 },
  ];
}

export function buildApparelProductApiBody(
  values: ApparelProductFormValues,
  media: { type: "photo" | "video"; url: string }[]
): ApparelProductApiBody {
  const colorName = values.color.name.trim();
  const colorHex = values.color.hex.trim() || "#888888";
  const sizeRows = sortSizeStockRows(
    values.sizeRows.filter((row) => row.label.trim())
  );
  const totalStock = totalStockFromSizeRows(sizeRows);
  const categoryIds = Array.from(new Set(values.categoryIds));
  const subcategoryIds = Array.from(new Set(values.subcategoryIds));

  return {
    name: values.name.trim(),
    short_description: values.shortDescription.trim() || null,
    description: values.description.trim() || null,
    price: Number(values.price),
    old_price: values.oldPrice ? Number(values.oldPrice) : null,
    discount_percentage: values.discountPercentage
      ? Number(values.discountPercentage)
      : null,
    priority: values.priority.trim() ? Number(values.priority) : 0,
    stock: values.inStock
      ? totalStock > 0
        ? totalStock
        : VIRTUAL_STOCK_WHEN_IN_STOCK
      : 0,
    in_stock: values.inStock,
    is_hit: values.isHit,
    is_new: values.isNew,
    top_sale: false,
    limited_edition: false,
    is_promo: false,
    dietitian_approved: false,
    free_delivery_badge: false,
    gift_product_id: null,
    bought_together_ids: values.boughtTogetherIds,
    pair_together_ids: values.colorLinkedIds,
    color_options: colorName
      ? serializeColorOptions([{ hex: colorHex, name: colorName }])
      : [],
    white_color_surcharge_enabled: false,
    size_variants: serializeSizeStock(sizeRows),
    subtitle: null,
    category_id: categoryIds[0] ?? null,
    subcategory_id: subcategoryIds[0] ?? null,
    category_ids: categoryIds,
    subcategory_ids: subcategoryIds,
    media,
  };
}

export function apparelFormFromProduct(product: {
  name?: string;
  short_description?: string | null;
  description?: string | null;
  price?: number;
  old_price?: number | null;
  discount_percentage?: number | null;
  priority?: number | null;
  color_options?: unknown;
  pair_together_ids?: number[];
  bought_together_ids?: number[];
  size_variants?: unknown;
  in_stock?: boolean;
  stock?: number;
  is_new?: boolean;
  is_hit?: boolean;
  category_id?: number | null;
  category_ids?: number[];
  subcategory_id?: number | null;
  subcategory_ids?: number[];
}): ApparelProductFormValues {
  const colors = parseColorOptions(product.color_options);
  const color = colors[0] ?? defaultApparelColor();

  const sizeRows = parseSizeStock(product.size_variants);
  const sizes = sizeRows.length > 0 ? sizeRows : defaultApparelSizeRows();

  const categoryIds = Array.isArray(product.category_ids)
    ? product.category_ids
    : product.category_id != null
      ? [product.category_id]
      : [];
  const subcategoryIds = Array.isArray(product.subcategory_ids)
    ? product.subcategory_ids
    : product.subcategory_id != null
      ? [product.subcategory_id]
      : [];

  return {
    name: product.name ?? "",
    shortDescription: product.short_description ?? "",
    description: product.description ?? "",
    price: product.price != null ? String(product.price) : "",
    oldPrice: product.old_price != null ? String(product.old_price) : "",
    discountPercentage:
      product.discount_percentage != null ? String(product.discount_percentage) : "",
    priority: product.priority != null ? String(product.priority) : "0",
    color,
    colorLinkedIds: Array.isArray(product.pair_together_ids)
      ? product.pair_together_ids.filter((n) => Number.isInteger(n) && n > 0)
      : [],
    boughtTogetherIds: Array.isArray(product.bought_together_ids)
      ? product.bought_together_ids.filter((n) => Number.isInteger(n) && n > 0)
      : [],
    sizeRows: sizes,
    inStock: product.in_stock !== false,
    isNew: product.is_new === true,
    isHit: product.is_hit === true,
    categoryIds,
    subcategoryIds,
  };
}
