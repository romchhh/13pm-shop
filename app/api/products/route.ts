// app/api/products/route.ts

import { NextResponse } from "next/server";
import { sqlGetAllProducts, sqlPostProduct, sqlSyncSizeVariantsOrdered } from "@/lib/sql";
import { revalidateProducts } from "@/lib/revalidate";
import { uploadProductMediaFiles } from "@/lib/uploadProductMedia";
import { apiLogger } from "@/lib/logger";

// Helper function to determine file type
function getFileType(mimeType: string, filename: string): "photo" | "video" {
  // Check MIME type first
  if (mimeType.startsWith("video/")) {
    return "video";
  }

  // Fallback: check file extension if MIME type is generic or unknown
  const ext = filename.split(".").pop()?.toLowerCase();
  const videoExtensions = [
    "mp4",
    "webm",
    "ogg",
    "mov",
    "avi",
    "mkv",
    "flv",
    "wmv",
  ];

  if (ext && videoExtensions.includes(ext)) {
    return "video";
  }

  return "photo";
}

// =========================
// GET /api/products
// =========================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    let products = await sqlGetAllProducts();

    // Mobile pagination for better performance
    if (limit) {
      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset || "0");
      products = products.slice(offsetNum, offsetNum + limitNum);
    }

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=1200, stale-while-revalidate=2400",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    apiLogger.error("GET", "/api/products", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// Enable revalidation every 20 minutes
export const revalidate = 1200;

// =========================
// POST /api/products
// =========================
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // JSON flow: expects media already uploaded via /api/images
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const {
        name,
        subtitle,
        release_form,
        course,
        package_weight,
        main_info,
        short_description,
        description,
        main_action,
        indications_for_use,
        benefits,
        full_composition,
        usage_method,
        contraindications,
        storage_conditions,
        price,
        old_price,
        discount_percentage,
        priority = 0,
        stock = 0,
        media = [],
        top_sale = false,
        in_stock = true,
        limited_ition,
        limited_edition = false,
        category_id = null,
        subcategory_id = null,
        fabric_composition,
        has_lining = false,
        lining_description,
        category_ids = [],
        subcategory_ids = [],
        is_hit = false,
        dietitian_approved = false,
        is_promo = false,
        free_delivery_badge = false,
        gift_product_id = null,
        bought_together_ids = [],
        pair_together_ids = [],
        color_options,
        size_variants,
        is_new = false,
        size_group_ordered_ids: sizeGroupOrderedBody = undefined,
      } = body || {};

      if (!name || typeof price !== "number") {
        return NextResponse.json(
          { error: "Missing required fields: name, price" },
          { status: 400 }
        );
      }

      const product = await sqlPostProduct({
        name,
        subtitle: subtitle ?? null,
        release_form: release_form ?? null,
        course: course ?? null,
        package_weight: package_weight ?? null,
        main_info: main_info ?? null,
        short_description: short_description ?? null,
        description: description ?? null,
        main_action: main_action ?? null,
        indications_for_use: indications_for_use ?? null,
        benefits: benefits ?? null,
        full_composition: full_composition ?? null,
        usage_method: usage_method ?? null,
        contraindications: contraindications ?? null,
        storage_conditions: storage_conditions ?? null,
        price,
        old_price,
        discount_percentage,
        priority,
        stock: typeof stock === "number" ? stock : Number(stock) || 0,
        media,
        top_sale,
        in_stock: in_stock !== false,
        limited_edition:
          typeof limited_ition === "boolean" ? limited_ition : limited_edition,
        is_hit: is_hit === true,
        dietitian_approved: dietitian_approved === true,
        is_promo: is_promo === true,
        free_delivery_badge: free_delivery_badge === true,
        gift_product_id:
          gift_product_id === "" || gift_product_id == null ? null : Number(gift_product_id),
        bought_together_ids: Array.isArray(bought_together_ids)
          ? bought_together_ids
              .map((x: unknown) => Number(x))
              .filter((n: number) => Number.isInteger(n) && n > 0)
          : [],
        pair_together_ids: Array.isArray(pair_together_ids)
          ? pair_together_ids
              .map((x: unknown) => Number(x))
              .filter((n: number) => Number.isInteger(n) && n > 0)
          : [],
        color_options: color_options ?? [],
        size_variants: size_variants ?? [],
        is_new: is_new === true,
        category_id,
        subcategory_id,
        fabric_composition: fabric_composition ?? null,
        has_lining,
        lining_description: lining_description ?? null,
        category_ids: Array.isArray(category_ids)
          ? category_ids
              .map((id: unknown) => Number(id))
              .filter((id: number) => Number.isInteger(id) && id > 0)
          : [],
        subcategory_ids: Array.isArray(subcategory_ids)
          ? subcategory_ids
              .map((id: unknown) => Number(id))
              .filter((id: number) => Number.isInteger(id) && id > 0)
          : [],
      });

      if (Array.isArray(sizeGroupOrderedBody) && sizeGroupOrderedBody.length > 0) {
        const newId = product.id;
        const resolved = sizeGroupOrderedBody
          .map((x: unknown) => {
            const n = Number(x);
            if (n === 0) return newId;
            return n;
          })
          .filter((n: number) => Number.isInteger(n) && n > 0);
        const seen = new Set<number>();
        const orderedUnique: number[] = [];
        for (const id of resolved) {
          if (seen.has(id)) continue;
          seen.add(id);
          orderedUnique.push(id);
        }
        if (orderedUnique.length > 0) {
          await sqlSyncSizeVariantsOrdered(orderedUnique);
        }
      }

      await revalidateProducts();
      return NextResponse.json(product, { status: 201 });
    }

    // Multipart form fallback
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const price = Number(formData.get("price"));
    const oldPrice = formData.get("old_price")
      ? Number(formData.get("old_price"))
      : null;
    const discountPercentage = formData.get("discount_percentage")
      ? Number(formData.get("discount_percentage"))
      : null;
    const priority = formData.get("priority")
      ? Number(formData.get("priority"))
      : 0;
    const description = formData.get("description") as string;
    const stockRaw = formData.get("stock");
    const stock = stockRaw != null ? Number(stockRaw) || 0 : 0;
    const images = formData.getAll("images") as File[];
    const topSale = formData.get("top_sale") === "true";
    const limitedEdition = formData.get("limited_edition") === "true";
    const categoryId = formData.get("category_id")
      ? Number(formData.get("category_id"))
      : null;
    const subcategoryId = formData.get("subcategory_id")
      ? Number(formData.get("subcategory_id"))
      : null;
    const fabricComposition =
      formData.get("fabric_composition")?.toString() || "";
    const hasLining = formData.get("has_lining") === "true";
    const liningDescription =
      formData.get("lining_description")?.toString() || "";

    if (!name || !price) {
      return NextResponse.json(
        { error: "Missing required fields: name, price" },
        { status: 400 }
      );
    }

    const savedMedia = await uploadProductMediaFiles(images);
    apiLogger.info("POST", `/api/products`, `Media to save: ${savedMedia.length} files`);

    const product = await sqlPostProduct({
      name,
      description,
      price,
      old_price: oldPrice,
      discount_percentage: discountPercentage,
      priority,
      stock,
      top_sale: topSale,
      limited_edition: limitedEdition,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      fabric_composition: fabricComposition,
      has_lining: hasLining,
      lining_description: liningDescription,
      media: savedMedia,
    });

    await revalidateProducts();
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    apiLogger.error("POST", "/api/products", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
