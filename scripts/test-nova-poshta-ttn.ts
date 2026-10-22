#!/usr/bin/env ts-node
/**
 * Діагностика створення ТТН (з опційним контролем оплати NovaPay):
 * npx ts-node --project tsconfig.scripts.json scripts/test-nova-poshta-ttn.ts
 *
 * З контролем оплати:
 * NP_TEST_AFTERPAYMENT=500 npm run test-np-ttn
 *
 * Опційно: NP_TEST_CITY_REF, NP_TEST_WAREHOUSE_REF, NP_TEST_CITY, NP_TEST_WAREHOUSE,
 * NP_TEST_RECIPIENT_NAME, NP_TEST_RECIPIENT_PHONE, NP_TEST_KEEP_TTN=1
 */
import "dotenv/config";
import {
  createNovaPoshtaTtn,
  formatNovaPoshtaDateTime,
  isNovaPoshtaConfiguredForTtn,
} from "../lib/nova-poshta";

const NP_JSON = "https://api.novaposhta.ua/v2.0/json/";

async function deleteInternetDocument(documentRef: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const apiKey = process.env.NOVA_POSHTA_API_KEY?.trim();
  if (!apiKey) return { success: false, error: "NOVA_POSHTA_API_KEY missing" };

  const res = await fetch(NP_JSON, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey,
      modelName: "InternetDocument",
      calledMethod: "delete",
      methodProperties: { DocumentRefs: documentRef },
    }),
  });
  const json = (await res.json()) as {
    success?: boolean;
    errors?: string[];
  };
  if (!json.success) {
    return {
      success: false,
      error: (json.errors ?? []).join("; ") || "delete failed",
    };
  }
  return { success: true };
}

async function main() {
  const afterpaymentRaw = process.env.NP_TEST_AFTERPAYMENT?.trim();
  const afterpaymentOnGoodsCost =
    afterpaymentRaw && Number(afterpaymentRaw) > 0
      ? Math.round(Number(afterpaymentRaw))
      : null;
  const keepTtn = process.env.NP_TEST_KEEP_TTN === "1";

  console.log("=== Nova Poshta TTN diagnostic ===");
  console.log("DateTime (Kyiv):", formatNovaPoshtaDateTime());
  console.log("Configured for TTN:", isNovaPoshtaConfiguredForTtn());
  console.log("API key set:", Boolean(process.env.NOVA_POSHTA_API_KEY?.trim()));
  console.log("Sender ref set:", Boolean(process.env.NOVA_POSHTA_SENDER_REF?.trim()));
  console.log(
    "AfterpaymentOnGoodsCost (NovaPay):",
    afterpaymentOnGoodsCost ?? "(не передаємо)"
  );

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
    cost: afterpaymentOnGoodsCost ?? 500,
    afterpaymentOnGoodsCost,
    description: process.env.NOVA_POSHTA_DESCRIPTION?.trim() || "Одяг",
  });

  if ("error" in result) {
    console.error("FAIL:", result.error);
    if (
      afterpaymentOnGoodsCost != null &&
      /AfterpaymentOnGoodsCost|контрол/i.test(result.error)
    ) {
      console.error(
        "HINT: у кабінеті НП має бути підключений договір NovaPay / «Контроль оплати» на цьому API-ключі."
      );
    }
    process.exit(1);
  }

  console.log("OK: TTN created:", result.ttn);
  if (afterpaymentOnGoodsCost != null) {
    console.log(
      `OK: TTN створено з AfterpaymentOnGoodsCost=${afterpaymentOnGoodsCost} (контроль оплати NovaPay)`
    );
  }

  if (!keepTtn && result.documentRef) {
    const del = await deleteInternetDocument(result.documentRef);
    if (del.success) {
      console.log("OK: тестову ТТН видалено:", result.ttn);
    } else {
      console.warn("WARN: не вдалося видалити тестову ТТН:", del.error);
      console.warn("Видаліть вручну в кабінеті НП:", result.ttn);
    }
  } else if (keepTtn) {
    console.log("KEEP: ТТН залишено (NP_TEST_KEEP_TTN=1):", result.ttn);
  }
}

main().catch((error) => {
  console.error("FAIL:", error);
  process.exit(1);
});
