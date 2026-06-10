#!/usr/bin/env ts-node
/**
 * Діагностика створення ТТН на сервері:
 * npx ts-node --project tsconfig.scripts.json scripts/test-nova-poshta-ttn.ts
 *
 * Опційно: NP_TEST_CITY_REF, NP_TEST_WAREHOUSE_REF, NP_TEST_CITY, NP_TEST_WAREHOUSE
 */
import "dotenv/config";
import {
  createNovaPoshtaTtn,
  formatNovaPoshtaDateTime,
  isNovaPoshtaConfiguredForTtn,
} from "../lib/nova-poshta";

async function main() {
  console.log("=== Nova Poshta TTN diagnostic ===");
  console.log("DateTime (Kyiv):", formatNovaPoshtaDateTime());
  console.log("Configured for TTN:", isNovaPoshtaConfiguredForTtn());
  console.log("API key set:", Boolean(process.env.NOVA_POSHTA_API_KEY?.trim()));
  console.log("Sender ref set:", Boolean(process.env.NOVA_POSHTA_SENDER_REF?.trim()));

  if (!isNovaPoshtaConfiguredForTtn()) {
    console.error("FAIL: incomplete NOVA_POSHTA_* env on this host");
    process.exit(1);
  }

  const result = await createNovaPoshtaTtn({
    recipientName: process.env.NP_TEST_RECIPIENT_NAME?.trim() || "Тест Тестович",
    recipientPhone: process.env.NP_TEST_RECIPIENT_PHONE?.trim() || "380931112233",
    cityName: process.env.NP_TEST_CITY?.trim() || "Київ",
    warehouseDescription:
      process.env.NP_TEST_WAREHOUSE?.trim() ||
      "Відділення №1 (до 30 кг на одне місце): вул. Пирогівський шлях, 135",
    cityRef: process.env.NP_TEST_CITY_REF?.trim() || undefined,
    warehouseRef: process.env.NP_TEST_WAREHOUSE_REF?.trim() || undefined,
    cost: 500,
    description: process.env.NOVA_POSHTA_DESCRIPTION?.trim() || "Одяг",
  });

  if ("error" in result) {
    console.error("FAIL:", result.error);
    process.exit(1);
  }

  console.log("OK: TTN created:", result.ttn);
}

main().catch((error) => {
  console.error("FAIL:", error);
  process.exit(1);
});
