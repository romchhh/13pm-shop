/**
 * Парсинг тіла запитів для /api/admin/catalog/*
 */

export type ProductMediaInput = { type: "photo" | "video"; url: string };

export type AdminProductPayload = {
  name: string;
  subtitle?: string | null;
  release_form?: string | null;
  course?: string | null;
  package_weight?: string | null;
  main_info?: string | null;
  short_description?: string | null;
  description?: string | null;
  main_action?: string | null;
  indications_for_use?: string | null;
  benefits?: string | null;
  full_composition?: string | null;
  usage_method?: string | null;
  contraindications?: string | null;
  storage_conditions?: string | null;
  price: number;
  old_price?: number | null;
  discount_percentage?: number | null;
  priority?: number;
  stock?: number;
  top_sale?: boolean;
  in_stock?: boolean;
  limited_edition?: boolean;
  is_hit?: boolean;
  is_new?: boolean;
  dietitian_approved?: boolean;
  is_promo?: boolean;
  free_delivery_badge?: boolean;
  gift_product_id?: number | null;
  bought_together_ids?: number[];
  pair_together_ids?: number[];
  color_options?: unknown;
  white_color_surcharge_enabled?: boolean;
  size_variants?: unknown;
  size_group_ordered_ids?: number[];
  size_linked_ids?: number[];
  season?: string[];
  category_id?: number | null;
  subcategory_id?: number | null;
  category_ids?: number[];
  subcategory_ids?: number[];
  fabric_composition?: string | null;
  has_lining?: boolean;
  lining_description?: string | null;
  media?: ProductMediaInput[];
};

function parseIdArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x) => Number(x))
    .filter((n) => Number.isInteger(n) && n > 0);
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

export function parseAdminProductPayload(body: Record<string, unknown>): AdminProductPayload {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const priceRaw = body.price;
  const price =
    typeof priceRaw === "number"
      ? priceRaw
      : priceRaw != null
        ? Number(priceRaw)
        : NaN;

  if (!name || !Number.isFinite(price)) {
    throw new Error("Обов'язкові поля: name (string), price (number)");
  }

  const boughtTogether =
    body.bought_together_ids !== undefined
      ? parseIdArray(body.bought_together_ids)
      : body.related_product_ids !== undefined
        ? parseIdArray(body.related_product_ids)
        : [];

  const pairTogether =
    body.color_linked_ids !== undefined
      ? parseIdArray(body.color_linked_ids)
      : body.pair_together_ids !== undefined
        ? parseIdArray(body.pair_together_ids)
        : body.paired_product_ids !== undefined
          ? parseIdArray(body.paired_product_ids)
          : [];

  const giftRaw = body.gift_product_id;
  const gift_product_id =
    giftRaw === null || giftRaw === undefined || giftRaw === ""
      ? null
      : Number(giftRaw);

  const media: ProductMediaInput[] = Array.isArray(body.media)
    ? body.media
        .map((m) => {
          const item = m as { type?: string; url?: string };
          if (!item?.url || typeof item.url !== "string") return null;
          const type = item.type === "video" ? "video" : "photo";
          return { type, url: item.url.trim() };
        })
        .filter((m): m is ProductMediaInput => m !== null)
    : [];

  return {
    name,
    subtitle: (body.subtitle as string) ?? null,
    release_form: (body.release_form as string) ?? null,
    course: (body.course as string) ?? null,
    package_weight: (body.package_weight as string) ?? null,
    main_info: (body.main_info as string) ?? null,
    short_description: (body.short_description as string) ?? null,
    description: (body.description as string) ?? null,
    main_action: (body.main_action as string) ?? null,
    indications_for_use: (body.indications_for_use as string) ?? null,
    benefits: (body.benefits as string) ?? null,
    full_composition: (body.full_composition as string) ?? null,
    usage_method: (body.usage_method as string) ?? null,
    contraindications: (body.contraindications as string) ?? null,
    storage_conditions: (body.storage_conditions as string) ?? null,
    price,
    old_price: body.old_price != null ? Number(body.old_price) : null,
    discount_percentage:
      body.discount_percentage != null ? Number(body.discount_percentage) : null,
    priority: body.priority != null ? Number(body.priority) : 0,
    stock: body.stock != null ? Number(body.stock) : 0,
    top_sale: body.top_sale === true,
    in_stock: body.in_stock !== false,
    limited_edition: body.limited_edition === true,
    is_hit: body.is_hit === true,
    is_new: body.is_new === true,
    dietitian_approved: body.dietitian_approved === true,
    is_promo: body.is_promo === true,
    free_delivery_badge: body.free_delivery_badge === true,
    gift_product_id:
      gift_product_id != null && Number.isInteger(gift_product_id) && gift_product_id > 0
        ? gift_product_id
        : null,
    bought_together_ids: boughtTogether,
    pair_together_ids: pairTogether,
    color_options: body.color_options ?? [],
    white_color_surcharge_enabled: body.white_color_surcharge_enabled !== false,
    size_variants: body.size_variants ?? [],
    size_group_ordered_ids: parseIdArray(body.size_group_ordered_ids),
    size_linked_ids: parseIdArray(body.size_linked_ids),
    season: parseStringArray(body.season),
    category_id: body.category_id != null ? Number(body.category_id) : null,
    subcategory_id: body.subcategory_id != null ? Number(body.subcategory_id) : null,
    category_ids: parseIdArray(body.category_ids),
    subcategory_ids: parseIdArray(body.subcategory_ids),
    fabric_composition: (body.fabric_composition as string) ?? null,
    has_lining: body.has_lining === true,
    lining_description: (body.lining_description as string) ?? null,
    media,
  };
}

export async function parseRequestProductPayload(
  req: Request
): Promise<{ payload: AdminProductPayload; imageFiles: File[] }> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const dataRaw = formData.get("data");
    if (typeof dataRaw !== "string" || !dataRaw.trim()) {
      throw new Error('multipart: поле "data" має містити JSON товару');
    }
    const body = JSON.parse(dataRaw) as Record<string, unknown>;
    const imageFiles = [
      ...formData.getAll("images"),
      ...formData.getAll("image"),
    ].filter((f): f is File => f instanceof File && f.size > 0);
    return { payload: parseAdminProductPayload(body), imageFiles };
  }

  const body = (await req.json()) as Record<string, unknown>;
  return { payload: parseAdminProductPayload(body), imageFiles: [] };
}

export type AdminCategoryPayload = {
  name: string;
  priority?: number;
  description?: string | null;
  mediaType?: string | null;
  mediaUrl?: string | null;
};

export function parseAdminCategoryPayload(body: Record<string, unknown>): AdminCategoryPayload {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) throw new Error("Обов'язкове поле: name");

  return {
    name,
    priority: body.priority != null ? Number(body.priority) : 0,
    description:
      typeof body.description === "string"
        ? body.description
        : body.description == null
          ? null
          : String(body.description),
    mediaType: (body.mediaType as string) ?? (body.media_type as string) ?? null,
    mediaUrl: (body.mediaUrl as string) ?? (body.media_url as string) ?? null,
  };
}

export async function parseRequestCategoryPayload(
  req: Request
): Promise<{ payload: AdminCategoryPayload; imageFile: File | null }> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const dataRaw = formData.get("data");
    if (typeof dataRaw !== "string" || !dataRaw.trim()) {
      throw new Error('multipart: поле "data" має містити JSON категорії');
    }
    const body = JSON.parse(dataRaw) as Record<string, unknown>;
    const imageCandidate = formData.get("image") ?? formData.get("images");
    const imageFile =
      imageCandidate instanceof File && imageCandidate.size > 0 ? imageCandidate : null;
    return { payload: parseAdminCategoryPayload(body), imageFile };
  }

  const body = (await req.json()) as Record<string, unknown>;
  return { payload: parseAdminCategoryPayload(body), imageFile: null };
}

export function adminProductPayloadToSql(
  payload: AdminProductPayload,
  media: ProductMediaInput[]
) {
  return {
    name: payload.name,
    subtitle: payload.subtitle ?? null,
    release_form: payload.release_form ?? null,
    course: payload.course ?? null,
    package_weight: payload.package_weight ?? null,
    main_info: payload.main_info ?? null,
    short_description: payload.short_description ?? null,
    description: payload.description ?? null,
    main_action: payload.main_action ?? null,
    indications_for_use: payload.indications_for_use ?? null,
    benefits: payload.benefits ?? null,
    full_composition: payload.full_composition ?? null,
    usage_method: payload.usage_method ?? null,
    contraindications: payload.contraindications ?? null,
    storage_conditions: payload.storage_conditions ?? null,
    price: payload.price,
    old_price: payload.old_price ?? null,
    discount_percentage: payload.discount_percentage ?? null,
    priority: payload.priority ?? 0,
    stock: payload.stock ?? 0,
    top_sale: payload.top_sale ?? false,
    in_stock: payload.in_stock !== false,
    limited_edition: payload.limited_edition ?? false,
    is_hit: payload.is_hit ?? false,
    is_new: payload.is_new ?? false,
    dietitian_approved: payload.dietitian_approved ?? false,
    is_promo: payload.is_promo ?? false,
    free_delivery_badge: payload.free_delivery_badge ?? false,
    gift_product_id: payload.gift_product_id ?? null,
    bought_together_ids: payload.bought_together_ids ?? [],
    pair_together_ids: payload.pair_together_ids ?? [],
    color_options: payload.color_options ?? [],
    white_color_surcharge_enabled: payload.white_color_surcharge_enabled !== false,
    size_variants: payload.size_variants ?? [],
    season: payload.season ?? [],
    category_id: payload.category_id ?? null,
    subcategory_id: payload.subcategory_id ?? null,
    category_ids: payload.category_ids ?? [],
    subcategory_ids: payload.subcategory_ids ?? [],
    fabric_composition: payload.fabric_composition ?? null,
    has_lining: payload.has_lining ?? false,
    lining_description: payload.lining_description ?? null,
    media,
  };
}
