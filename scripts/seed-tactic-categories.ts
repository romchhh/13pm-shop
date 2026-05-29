#!/usr/bin/env ts-node

/**
 * Категорії каталогу 13pm tactic.
 * Запуск: npm run seed-tactic-categories
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

loadEnvUrl();

const TACTIC_CATEGORIES: { name: string; priority: number }[] = [
  { name: "Комплекти", priority: 70 },
  { name: "Футболки", priority: 65 },
  { name: "Флісова кофта", priority: 60 },
  { name: "UBACS", priority: 55 },
  { name: "Штани", priority: 50 },
  { name: "Головні убори", priority: 45 },
  { name: "Аксесуари", priority: 40 },
];

async function uniqueCategorySlug(
  base: string,
  prisma: import("@prisma/client").PrismaClient
): Promise<string> {
  const { ensureUniqueSlug } = await import("../lib/slug");
  return ensureUniqueSlug(base, (s) =>
    prisma.category.findFirst({ where: { slug: s } }).then(Boolean)
  );
}

async function main() {
  const { prisma } = await import("../lib/prisma");
  const { textToSlug } = await import("../lib/slug");

  console.log("🚀 Додавання категорій 13pm tactic…\n");

  const existing = await prisma.category.findMany({ select: { name: true } });
  const existingNames = new Set(existing.map((c) => c.name.trim().toLowerCase()));

  for (const { name, priority } of TACTIC_CATEGORIES) {
    if (existingNames.has(name.toLowerCase())) {
      console.log(`⏭️  «${name}» вже є — пропуск`);
      continue;
    }
    const slug = await uniqueCategorySlug(textToSlug(name), prisma);
    const created = await prisma.category.create({
      data: { name, slug, priority },
    });
    console.log(`✅ «${name}» (id ${created.id}, slug: ${slug})`);
  }

  console.log("\n🎉 Готово.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
