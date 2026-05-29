#!/usr/bin/env ts-node

/**
 * Тестові товари 13pm tactic (одяг).
 * Запуск: npm run seed-tactic-products
 */

import fs from "node:fs";
import path from "node:path";

function loadEnvUrl(): void {
  const envPath = path.join(process.cwd(), ".env");
  if (!process.env.DATABASE_URL && fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("DATABASE_URL=")) continue;
      let value = trimmed.slice("DATABASE_URL=".length).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (value) process.env.DATABASE_URL = value;
      break;
    }
  }
  if (!process.env.DATABASE_URL?.startsWith("postgres")) {
    console.error("❌ DATABASE_URL не задано. Перевірте .env");
    process.exit(1);
  }
}

const SEED_IMAGE_NAME = "seed-tactic-hero.png";

const TACTIC_PRODUCTS: {
  name: string;
  category: string;
  price: number;
  old_price?: number;
  discount_percentage?: number;
  short_description: string;
  description: string;
  is_new?: boolean;
  is_hit?: boolean;
  is_promo?: boolean;
  line?: string;
}[] = [
  {
    name: "Футболка тактична ALPHA",
    category: "Футболки",
    price: 890,
    short_description: "Бавовняна футболка лінійки ALPHA. Посилені плечі, комфорт у полі.",
    description:
      "Футболка **ALPHA** — базовий шар для щоденного носіння та тренувань.\n\n- Склад: бавовна з еластаном\n- Посилені плечі\n- Лінійка ALPHA",
    is_new: true,
    line: "ALPHA",
  },
  {
    name: "Фліс 1/4 zip BRAVO",
    category: "Флісова кофта",
    price: 1650,
    short_description: "Теплий фліс із короткою блискавкою. Лінійка BRAVO.",
    description: "Утеплений фліс **BRAVO** для прохолодної погоди та активного відпочинку.",
    line: "BRAVO",
  },
  {
    name: "UBACS поло DELTA",
    category: "UBACS",
    price: 720,
    old_price: 820,
    discount_percentage: 12,
    short_description: "Легке поло з вентиляційними вставками.",
    description: "**UBACS** у виконанні лінійки DELTA — дихаюча тканина, зручний крій.",
    is_promo: true,
    line: "DELTA",
  },
  {
    name: "Штани тактичні BRAVO",
    category: "Штани",
    price: 2190,
    short_description: "Міцні штани з посиленими колінами та кишенями.",
    description: "Штани **BRAVO** — зручність руху, надійні шви, практичні кишені.",
    is_hit: true,
    line: "BRAVO",
  },
  {
    name: "Бейсболка 13pm tactic",
    category: "Головні убори",
    price: 490,
    short_description: "Регульована бейсболка з вишивкою 13pm.",
    description: "Класична бейсболка з логотипом **13pm tactic**.",
    line: "ALPHA",
  },
  {
    name: "Ремінь тактичний",
    category: "Аксесуари",
    price: 650,
    short_description: "Нейлоновий ремінь з металевою пряжкою.",
    description: "Міцний ремінь для щоденного носіння та спорядження.",
  },
  {
    name: "Комплект ALPHA Starter",
    category: "Комплекти",
    price: 3290,
    old_price: 3680,
    discount_percentage: 11,
    short_description: "Футболка + штани ALPHA в одному комплекті.",
    description:
      "Готовий комплект **ALPHA Starter**: футболка та штани однієї лінійки.\n\nІдеально для першого замовлення.",
    is_hit: true,
    is_promo: true,
    line: "ALPHA",
  },
  {
    name: "Худі тактичне DELTA",
    category: "Футболки",
    price: 1890,
    short_description: "Утеплене худі з капюшоном. Лінійка DELTA.",
    description: "Тепле худі **DELTA** — комфорт після тренування та на вихідні.",
    is_new: true,
    line: "DELTA",
  },
];

const DEFAULT_SIZES = [
  { label: "S", stock: 4 },
  { label: "M", stock: 8 },
  { label: "L", stock: 6 },
  { label: "XL", stock: 3 },
];

const HAT_SIZES = [{ label: "One size", stock: 12 }];

function ensureSeedImage(): string {
  const src = path.join(process.cwd(), "public", "hero-main.png");
  const dir = path.join(process.cwd(), "product-images");
  const dest = path.join(dir, SEED_IMAGE_NAME);

  if (!fs.existsSync(src)) {
    console.warn(`⚠️  ${src} не знайдено — товари без фото`);
    return "";
  }

  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
    console.log(`🖼️  Скопійовано зображення → product-images/${SEED_IMAGE_NAME}`);
  }
  return SEED_IMAGE_NAME;
}

async function main() {
  loadEnvUrl();

  const { prisma } = await import("../lib/prisma");
  const { textToSlug, ensureUniqueSlug } = await import("../lib/slug");
  const { serializeColorOptions, serializeSizeStock, totalStockFromSizeRows } = await import(
    "../lib/productOptions"
  );

  const imageFile = ensureSeedImage();
  const media = imageFile ? [{ type: "photo" as const, url: imageFile }] : [];

  console.log("\n🚀 Додавання тестових товарів 13pm tactic…\n");

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
  });
  const categoryByName = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));

  let created = 0;
  let skipped = 0;

  for (const item of TACTIC_PRODUCTS) {
    const exists = await prisma.product.findFirst({
      where: { name: { equals: item.name, mode: "insensitive" } },
    });
    if (exists) {
      console.log(`⏭️  «${item.name}» вже є — пропуск`);
      skipped += 1;
      continue;
    }

    const categoryId = categoryByName.get(item.category.toLowerCase());
    if (!categoryId) {
      console.warn(`⚠️  Категорію «${item.category}» не знайдено — пропуск «${item.name}»`);
      continue;
    }

    const sizeRows =
      item.category === "Головні убори" || item.category === "Аксесуари"
        ? HAT_SIZES
        : DEFAULT_SIZES;
    const stock = totalStockFromSizeRows(sizeRows);

    const slug = await ensureUniqueSlug(textToSlug(item.name), (s) =>
      prisma.product.findFirst({ where: { slug: s } }).then(Boolean)
    );

    const createdProduct = await prisma.product.create({
      data: {
        name: item.name,
        slug,
        subtitle: item.line ? `Лінійка ${item.line}` : null,
        shortDescription: item.short_description,
        description: item.description,
        price: item.price,
        oldPrice: item.old_price ?? null,
        discountPercentage: item.discount_percentage ?? null,
        stock,
        inStock: stock > 0,
        isNew: item.is_new ?? false,
        isHit: item.is_hit ?? false,
        isPromo: item.is_promo ?? false,
        topSale: false,
        limitedEdition: false,
        colorOptions: serializeColorOptions([
          { hex: "#1a1a1a", name: "Чорний" },
          { hex: "#4b5320", name: "Олива" },
        ]) as object,
        sizeVariants: serializeSizeStock(sizeRows) as object,
        categoryId,
        media: media.length
          ? { create: media.map((m) => ({ type: m.type, url: m.url })) }
          : undefined,
      },
    });

    await prisma.productCategoryLink.createMany({
      data: [{ productId: createdProduct.id, categoryId }],
      skipDuplicates: true,
    });

    console.log(`✅ ${item.name} (id ${createdProduct.id}) → ${item.category}`);
    created += 1;
  }

  console.log(`\n🎉 Готово: додано ${created}, пропущено ${skipped}.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
