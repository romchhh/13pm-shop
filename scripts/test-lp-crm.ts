/**
 * Тест інтеграції LP-CRM (Landing page → addNewOrder).
 * Товари йдуть у comment; у products — службовий дефолтний id.
 *
 *   npm run test-lp-crm
 */
import "dotenv/config";
import { register } from "tsconfig-paths";
import { resolve } from "path";

register({
  baseUrl: resolve(__dirname, ".."),
  paths: { "@/*": ["./*"] },
});

import {
  sendOrderToLpCrm,
  generateLpCrmOrderId,
  isLpCrmConfigured,
} from "../lib/lpCrm";

async function main() {
  const phone = `38050${String(Date.now()).slice(-7)}`;
  const siteOrderRef = `test-${Date.now()}`;

  console.log("=== LP-CRM integration test ===");
  console.log("URL:", process.env.LP_CRM_API_URL || "(missing)");
  console.log("Key:", process.env.LP_CRM_API_KEY?.trim() ? "set" : "MISSING");
  console.log("Site host:", process.env.LP_CRM_SITE_HOST || "13pm.com.ua");
  console.log("Default product:", process.env.LP_CRM_DEFAULT_PRODUCT_ID || "1");
  console.log("Configured:", isLpCrmConfigured());
  console.log("Test phone:", phone);
  console.log("order_id sample:", generateLpCrmOrderId());

  if (!isLpCrmConfigured()) {
    console.error(
      "\n✗ Додайте LP_CRM_API_KEY і LP_CRM_API_URL у .env, потім повторіть тест."
    );
    process.exit(1);
  }

  const result = await sendOrderToLpCrm({
    siteOrderRef,
    customerName: "Тест 13pm CRM",
    phone,
    email: "crm-test@13pm.com.ua",
    city: "Київ",
    postOffice: "Відділення №5",
    deliveryMethod: "nova_poshta_branch",
    paymentType: "prepay",
    comment: "Автотест: товари в описі",
    utm: {
      utm_source: "site",
      utm_medium: "test",
      utm_campaign: "lp_crm_comment",
    },
    products: [
      {
        productId: 1,
        price: 890,
        count: 1,
        name: "Футболка тактична ALPHA",
        size: "M",
        color: "Olive",
      },
      {
        productId: 5,
        price: 490,
        count: 2,
        name: "Бейсболка 13pm tactic",
        size: "ONE",
      },
    ],
  });

  console.log("\nResult:", JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(1);
  console.log(
    `\n✓ CRM прийняв замовлення ${result.orderId} (site ref ${siteOrderRef}).`
  );
  console.log("  Перевірте comment: товари ALPHA + бейсболка ×2.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
