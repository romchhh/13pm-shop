#!/usr/bin/env ts-node

/**
 * Тестові товари — фоторамки з фанери (4 дизайни × 8 розмірів).
 * Запуск: npm run seed-frame-products
 *
 * Кожен розмір — окремий запис у БД; на сторінці товару перемикач розмірів
 * веде на відповідний slug (size_variants).
 */

import fs from "node:fs";
import path from "node:path";

function loadEnv(): void {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!process.env.DATABASE_URL && fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("DATABASE_URL=")) continue;
      let value = trimmed.slice("DATABASE_URL=".length).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      value = value.split(/\s+#\s+/)[0].trim();
      if (value) process.env.DATABASE_URL = value;
      break;
    }
  }
  if (!process.env.DATABASE_URL?.startsWith("postgres")) {
    console.error("❌ DATABASE_URL не задано. Перевірте .env у корені проєкту.");
    process.exit(1);
  }
}

/** Назви дизайнів (окремі лінійки товарів) */
const DESIGNS = [
  "Пташка на гілці",
  "Крилате серце",
  "Наша сімʼя",
  "Наша сімʼя з метеликами",
] as const;

/** Розміри рамки + опис слотів для фото + ціна (грн) */
const SIZE_ROWS = [
  { label: "46×52 см", photos: "фото 10×15 — 5 шт.", price: 860 },
  { label: "42×59 см", photos: "фото 9×13 — 8 шт.", price: 890 },
  { label: "50×70 см", photos: "фото 10×15 — 8 шт.", price: 1200 },
  { label: "59×83 см", photos: "фото 13×18 — 8 шт.", price: 1520 },
  { label: "45×60 см", photos: "фото 9×13 — 8 шт.", price: 890 },
  { label: "54×73 см", photos: "фото 10×15 — 8 шт.", price: 1290 },
  { label: "48×67 см", photos: "фото 13×18 — 2 шт., 9×13 — 7 шт.", price: 1240 },
  { label: "55×77 см", photos: "фото 15×21 — 2 шт., 10×15 — 7 шт.", price: 1560 },
] as const;

const COLOR_OPTIONS = [
  { hex: "#1a1a1a", name: "Чорний" },
  { hex: "#ffffff", name: "Білий" },
  { hex: "#8B5E3F", name: "Деревина" },
  { hex: "#E8C9A0", name: "Натуральний" },
];

const CATEGORY_NAME = "Рамки";

async function ensureCategory(): Promise<number> {
  const { prisma } = await import("../lib/prisma");
  const { sqlPostCategory } = await import("../lib/sql");

  const existing = await prisma.category.findFirst({
    where: { name: { equals: CATEGORY_NAME, mode: "insensitive" } },
  });
  if (existing) {
    console.log(`📁 Категорія «${CATEGORY_NAME}» (id ${existing.id})`);
    return existing.id;
  }

  const created = await sqlPostCategory(CATEGORY_NAME, 5);
  console.log(`📁 Створено категорію «${CATEGORY_NAME}» (id ${created.id})`);
  return created.id;
}

async function productExists(name: string, sizeLabel: string): Promise<boolean> {
  const { prisma } = await import("../lib/prisma");
  const found = await prisma.product.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      subtitle: { equals: sizeLabel, mode: "insensitive" },
    },
    select: { id: true },
  });
  return !!found;
}

async function main() {
  loadEnv();

  const { prisma } = await import("../lib/prisma");
  const { sqlPostProduct } = await import("../lib/sql");
  const { serializeColorOptions, serializeSizeVariants } = await import("../lib/productOptions");

  const categoryId = await ensureCategory();

  console.log("\n🚀 Додавання тестових рамок...\n");

  let createdCount = 0;
  let skippedCount = 0;

  for (const designName of DESIGNS) {
    console.log(`\n━━ ${designName} ━━`);

    const groupIds: number[] = [];
    let sizeIndex = 0;

    for (const row of SIZE_ROWS) {
      if (await productExists(designName, row.label)) {
        console.log(`  ⏭️  ${row.label} — вже є, пропуск`);
        skippedCount += 1;
        const existing = await prisma.product.findFirst({
          where: {
            name: { equals: designName, mode: "insensitive" },
            subtitle: { equals: row.label, mode: "insensitive" },
          },
          select: { id: true, slug: true },
        });
        if (existing) groupIds.push(existing.id);
        sizeIndex += 1;
        continue;
      }

      const shortDescription = `${row.label}. ${row.photos}.`;
      const description = [
        `${designName} — декоративна рамка з фанери ручної роботи.`,
        "",
        `Розмір: ${row.label}.`,
        `Слоти для фото: ${row.photos}.`,
        "",
        "Матеріал: фанера. Можливий вибір кольору на сторінці товару.",
        "Доставка по Україні. Уточнюйте наявність у менеджера.",
      ].join("\n");

      const { id } = await sqlPostProduct({
        name: designName,
        subtitle: row.label,
        short_description: shortDescription,
        description,
        price: row.price,
        stock: 5,
        in_stock: true,
        top_sale: false,
        limited_edition: false,
        is_hit: false,
        is_promo: false,
        is_new: sizeIndex === 0,
        color_options: serializeColorOptions(COLOR_OPTIONS),
        size_variants: [],
        category_id: categoryId,
        category_ids: [categoryId],
      });

      const full = await prisma.product.findUnique({
        where: { id },
        select: { id: true, slug: true },
      });

      groupIds.push(id);

      console.log(`  ✅ ${row.label} — ${row.price} грн (id ${id}, slug: ${full?.slug ?? "—"})`);
      createdCount += 1;
      sizeIndex += 1;
    }

    if (groupIds.length < 2) {
      console.log("  ⚠️  Недостатньо варіантів для size_variants, пропуск оновлення звʼязків");
      continue;
    }

    const productsInGroup = await prisma.product.findMany({
      where: { id: { in: groupIds } },
      select: { id: true, slug: true, subtitle: true },
      orderBy: { id: "asc" },
    });

    const variantsPayload = serializeSizeVariants(
      productsInGroup.map((p) => ({
        label: p.subtitle ?? String(p.id),
        productId: p.id,
        slug: p.slug,
      }))
    );

    for (const p of productsInGroup) {
      await prisma.product.update({
        where: { id: p.id },
        data: { sizeVariants: variantsPayload as object },
      });
    }

    console.log(`  🔗 size_variants оновлено для ${productsInGroup.length} товарів`);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Створено: ${createdCount}`);
  console.log(`⏭️  Пропущено (вже були): ${skippedCount}`);
  console.log(`📦 Лінійок дизайну: ${DESIGNS.length}`);
  console.log(`📐 Розмірів на лінійку: ${SIZE_ROWS.length}`);
  console.log("🎉 Готово.\n");
}

main().catch((err) => {
  console.error("❌ Помилка:", err);
  process.exit(1);
});
