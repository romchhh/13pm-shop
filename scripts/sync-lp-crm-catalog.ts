/**
 * Синхронізація сайту 13pm.com.ua і всіх товарів у каталог LP-CRM.
 *
 *   npm run sync-lp-crm
 *
 * Потрібен вихідний ключ:
 *   LP_CRM_OUTGOING_API_KEY=...  (Налаштування → Система → вихідний/исходящий ключ)
 *
 * Вхідний LP_CRM_API_KEY працює лише для addNewOrder.
 */
import "dotenv/config";
import { register } from "tsconfig-paths";
import { resolve } from "path";

register({
  baseUrl: resolve(__dirname, ".."),
  paths: { "@/*": ["./*"] },
});

import { PrismaClient } from "@prisma/client";
import {
  addLpCrmProduct,
  addLpCrmSite,
  getLpCrmProducts,
  isLpCrmCatalogConfigured,
  lpCrmCatalogKey,
} from "../lib/lpCrmCatalog";

const prisma = new PrismaClient();

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const host =
    (process.env.LP_CRM_SITE_HOST || "13pm.com.ua").trim() || "13pm.com.ua";

  console.log("=== LP-CRM catalog sync ===");
  console.log("Site host:", host);
  console.log(
    "Catalog key:",
    lpCrmCatalogKey()
      ? process.env.LP_CRM_OUTGOING_API_KEY?.trim()
        ? "LP_CRM_OUTGOING_API_KEY set"
        : "fallback LP_CRM_API_KEY (likely incoming-only)"
      : "MISSING"
  );

  if (!isLpCrmCatalogConfigured()) {
    console.error(
      "\n✗ Додайте LP_CRM_OUTGOING_API_KEY у .env\n" +
        "  CRM → Налаштування → Система → вихідний (исходящий) ключ API\n" +
        "  Вхідний ключ (addNewOrder) для каталогу не підходить."
    );
    process.exit(1);
  }

  // 1) Сайт
  console.log("\n→ Реєстрація сайту…");
  const siteResult = await addLpCrmSite({
    host,
    name: "13pm.com.ua",
    url: `https://${host}/`,
  });
  if (siteResult.ok) {
    console.log("✓ Сайт:", JSON.stringify(siteResult.data ?? siteResult.raw));
  } else {
    console.warn("⚠ Сайт:", siteResult.message);
    if (/ключ|key|не найден/i.test(siteResult.message)) {
      console.error(
        "\n✗ Вихідний ключ не прийнято CRM. Скопіюйте вихідний ключ з Налаштування → Система."
      );
      process.exit(1);
    }
  }

  await sleep(800);

  // 2) Існуючі товари в CRM
  console.log("\n→ Читання каталогу CRM…");
  const existing = await getLpCrmProducts();
  if (!existing.ok) {
    console.warn("⚠ getProducts:", existing.message);
    if (/ключ|key|не найден/i.test(existing.message)) {
      console.error(
        "\n✗ Потрібен саме вихідний ключ API (не вхідний для замовлень)."
      );
      process.exit(1);
    }
  } else {
    console.log(`✓ У CRM уже ${existing.data.length} товар(ів)`);
  }

  const byName = new Map<string, number>();
  const byArticle = new Map<string, number>();
  if (existing.ok) {
    for (const p of existing.data) {
      byName.set(p.name.trim().toLowerCase(), p.id);
      if (p.article) byArticle.set(String(p.article).trim().toLowerCase(), p.id);
    }
  }

  // 3) Товари сайту
  const products = await prisma.product.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      price: true,
      article: true,
      slug: true,
      crmProductId: true,
      category: { select: { name: true } },
    },
  });

  console.log(`\n→ Синк ${products.length} товар(ів) сайту…`);

  let created = 0;
  let linked = 0;
  let failed = 0;

  for (const product of products) {
    const nameKey = product.name.trim().toLowerCase();
    const articleKey = (product.article || product.slug || "").trim().toLowerCase();
    let crmId = product.crmProductId ?? null;

    if (!crmId) {
      crmId =
        (articleKey && byArticle.get(articleKey)) ||
        byName.get(nameKey) ||
        null;
    }

    if (crmId) {
      if (product.crmProductId !== crmId) {
        await prisma.product.update({
          where: { id: product.id },
          data: { crmProductId: crmId },
        });
      }
      console.log(`  · #${product.id} «${product.name}» → CRM #${crmId} (існує)`);
      linked += 1;
      continue;
    }

    await sleep(700);
    const add = await addLpCrmProduct({
      name: product.name,
      price: Number(product.price),
      article: product.article || product.slug || `site-${product.id}`,
      category: product.category?.name || "13pm",
      productId: product.id,
    });

    if (!add.ok) {
      console.warn(`  ✗ #${product.id} «${product.name}»: ${add.message}`);
      failed += 1;
      if (/ключ|key|не найден/i.test(add.message)) {
        console.error("\n✗ Зупинка: вихідний ключ не працює для addProduct.");
        process.exit(1);
      }
      continue;
    }

    let newId = add.data.id ?? null;
    if (!newId) {
      // Перечитати каталог і знайти за назвою
      await sleep(500);
      const refresh = await getLpCrmProducts();
      if (refresh.ok) {
        const found = refresh.data.find(
          (p) => p.name.trim().toLowerCase() === nameKey
        );
        newId = found?.id ?? null;
      }
    }

    if (newId) {
      await prisma.product.update({
        where: { id: product.id },
        data: { crmProductId: newId },
      });
      byName.set(nameKey, newId);
      console.log(`  ✓ #${product.id} «${product.name}» → CRM #${newId} (створено)`);
      created += 1;
    } else {
      console.warn(
        `  ⚠ #${product.id} «${product.name}»: створено, але id не повернуто`,
        JSON.stringify(add.raw)
      );
      failed += 1;
    }
  }

  console.log("\n=== Готово ===");
  console.log(`Прив’язано: ${linked}`);
  console.log(`Створено:   ${created}`);
  console.log(`Помилок:    ${failed}`);
  console.log(
    "\nЗамовлення братимуть Product.crmProductId. Перевірте Каталог → Товари в CRM."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
