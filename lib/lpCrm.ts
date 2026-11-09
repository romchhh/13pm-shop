import { phpSerialize } from "@/lib/phpSerialize";
import type { UtmAttribution } from "@/lib/utmAttribution";
import { createLogger } from "@/lib/logger";

const log = createLogger("lp-crm");

export type LpCrmOrderProduct = {
  /** ID товару на сайті (для логів / fallback). */
  productId: number | string;
  /** ID товару в каталозі LP-CRM (пріоритетніше за productId). */
  crmProductId?: number | string | null;
  price: number;
  count: number;
  name?: string | null;
  size?: string | null;
  color?: string | null;
};

export type LpCrmOrderInput = {
  /** Внутрішній invoice / UUID сайту — піде в additional_1 */
  siteOrderRef: string;
  customerName: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  postOffice?: string | null;
  deliveryMethod?: string | null;
  paymentType?: string | null;
  comment?: string | null;
  products: LpCrmOrderProduct[];
  utm?: UtmAttribution;
};

export type LpCrmResult =
  | { ok: true; orderId: string; raw: unknown }
  | { ok: false; skipped?: boolean; message: string; raw?: unknown };

function env(name: string): string {
  return (process.env[name] || "").trim();
}

function sitePublicUrl(): string {
  return (
    env("PUBLIC_URL") ||
    env("NEXT_PUBLIC_PUBLIC_URL") ||
    env("NEXTAUTH_URL") ||
    "https://13pm.com.ua"
  ).replace(/\/$/, "");
}

export function isLpCrmConfigured(): boolean {
  return Boolean(env("LP_CRM_API_KEY") && env("LP_CRM_API_URL"));
}

/** 11-значний order_id для LP-CRM. */
export function generateLpCrmOrderId(): string {
  const base = `${Date.now()}${Math.floor(Math.random() * 1_000_000)}`.replace(/\D/g, "");
  return base.slice(-11).padStart(11, "0");
}

function mapDeliveryId(deliveryMethod?: string | null): string {
  const explicit = env("LP_CRM_DELIVERY_ID");
  if (explicit) return explicit;
  if (deliveryMethod === "nova_poshta_branch") {
    return env("LP_CRM_DELIVERY_NOVA_POSHTA_BRANCH") || "";
  }
  if (deliveryMethod === "nova_poshta_courier") {
    return env("LP_CRM_DELIVERY_NOVA_POSHTA_COURIER") || "";
  }
  if (deliveryMethod === "showroom_pickup") {
    return env("LP_CRM_DELIVERY_PICKUP") || "";
  }
  if (deliveryMethod === "one_click") {
    return env("LP_CRM_DELIVERY_ONE_CLICK") || "";
  }
  return "";
}

function mapPaymentId(paymentType?: string | null): string {
  const explicit = env("LP_CRM_PAYMENT_ID");
  if (explicit) return explicit;
  if (paymentType === "full") return env("LP_CRM_PAYMENT_FULL") || "";
  if (paymentType === "prepay") return env("LP_CRM_PAYMENT_PREPAY") || "";
  return "";
}

function buildProductsPayload(products: LpCrmOrderProduct[]) {
  // CRM вимагає products[]; реальні позиції йдуть у comment.
  // Один службовий рядок з дефолтним ID + сумою, щоб не плодити невідомі id.
  const fallback = Number(env("LP_CRM_DEFAULT_PRODUCT_ID") || "1");
  const defaultId = Number.isFinite(fallback) && fallback > 0 ? fallback : 1;
  const total = products.reduce(
    (sum, p) => sum + Number(p.price || 0) * Math.max(1, Number(p.count) || 1),
    0
  );
  const count = products.reduce(
    (sum, p) => sum + Math.max(1, Math.round(Number(p.count) || 1)),
    0
  );
  return [
    {
      product_id: defaultId,
      price: String(Math.round(total * 100) / 100),
      count: String(Math.max(1, count)),
    },
  ];
}

function resolveCrmSiteHost(): { host: string; base: string } {
  const override = env("LP_CRM_SITE_HOST");
  const base = sitePublicUrl();
  if (override) {
    const host = override.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return { host, base: `https://${host}` };
  }
  let host = "13pm.com.ua";
  try {
    host = new URL(base).host;
  } catch {
    /* keep default */
  }
  return { host, base };
}

function buildSenderPayload(siteOrderRef: string) {
  const { host, base } = resolveCrmSiteHost();
  // LP-CRM визначає «сайт-лендінг» з HTTP_HOST / HTTP_REFERER у sender.
  // Щоб у картці замовлення було ім'я сайту (не ERROR SITE NAME) —
  // додайте лендінг з цим доменом у кабінеті vividmotor.lp-crm.biz.
  return {
    HTTP_HOST: host,
    HTTPS: "on",
    SERVER_NAME: host,
    REQUEST_URI: "/",
    REQUEST_SCHEME: "https",
    HTTP_REFERER: `${base}/`,
    HTTP_USER_AGENT: "13pm-site",
    site_order_ref: siteOrderRef,
  };
}

function buildComment(input: LpCrmOrderInput): string {
  const lines: string[] = [];
  // Товари — головне в описі (поки без синку каталогу CRM)
  lines.push("Товари:");
  for (const p of input.products) {
    const bits = [
      p.name || `Товар #${p.productId}`,
      `(site id ${p.productId})`,
      p.size ? `розмір ${p.size}` : null,
      p.color ? `колір ${p.color}` : null,
      `×${p.count}`,
      `${p.price} грн`,
    ].filter(Boolean);
    lines.push(`• ${bits.join(" · ")}`);
  }
  const total = input.products.reduce(
    (sum, p) => sum + Number(p.price || 0) * Math.max(1, Number(p.count) || 1),
    0
  );
  lines.push(`Сума товарів: ${Math.round(total * 100) / 100} грн`);
  lines.push("");
  lines.push(`Сайт-замовлення: ${input.siteOrderRef}`);
  lines.push(`Джерело: ${sitePublicUrl()}`);
  if (input.deliveryMethod) lines.push(`Доставка: ${input.deliveryMethod}`);
  if (input.paymentType) lines.push(`Оплата: ${input.paymentType}`);
  if (input.comment?.trim()) {
    lines.push("");
    lines.push(`Коментар клієнта: ${input.comment.trim()}`);
  }
  return lines.join("\n").slice(0, 1900);
}

function formatCrmMessage(message: unknown): string {
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.map(String).join("; ");
  if (message == null) return "";
  return String(message);
}

/**
 * Відправляє замовлення в LP-CRM (Landing page API).
 */
export async function sendOrderToLpCrm(
  input: LpCrmOrderInput
): Promise<LpCrmResult> {
  const apiKey = env("LP_CRM_API_KEY");
  const apiUrl = env("LP_CRM_API_URL");

  if (!apiKey || !apiUrl) {
    return {
      ok: false,
      skipped: true,
      message: "LP-CRM не налаштовано (LP_CRM_API_KEY / LP_CRM_API_URL)",
    };
  }

  if (!input.customerName?.trim() || !input.phone?.trim()) {
    return { ok: false, message: "ПІБ і телефон обов'язкові для LP-CRM" };
  }

  if (!input.products.length) {
    return { ok: false, message: "Порожній список товарів для LP-CRM" };
  }

  const crmOrderId = generateLpCrmOrderId();
  // Важливо: PHP-serialize БЕЗ попереднього encodeURIComponent —
  // URLSearchParams закодує один раз (як curl --data-urlencode).
  const productsSerialized = phpSerialize(buildProductsPayload(input.products));
  const senderSerialized = phpSerialize(buildSenderPayload(input.siteOrderRef));

  const deliveryAddress = [input.city, input.postOffice]
    .map((s) => (s || "").trim())
    .filter(Boolean)
    .join(", ");

  const body = new URLSearchParams();
  body.set("key", apiKey);
  body.set("order_id", crmOrderId);
  body.set("country", env("LP_CRM_COUNTRY") || "UA");
  const office = env("LP_CRM_OFFICE");
  if (office) body.set("office", office);
  body.set("products", productsSerialized);
  body.set("bayer_name", input.customerName.trim());
  body.set("phone", input.phone.trim());
  if (input.email?.trim()) body.set("email", input.email.trim());
  body.set("comment", buildComment(input));
  const delivery = mapDeliveryId(input.deliveryMethod);
  if (delivery) body.set("delivery", delivery);
  if (deliveryAddress) body.set("delivery_adress", deliveryAddress);
  const payment = mapPaymentId(input.paymentType);
  if (payment) body.set("payment", payment);
  body.set("sender", senderSerialized);
  body.set("additional_1", input.siteOrderRef);
  body.set("additional_2", resolveCrmSiteHost().host);
  body.set(
    "additional_3",
    input.products
      .map((p) => {
        const bits = [
          p.name || `#${p.productId}`,
          p.size || null,
          p.color || null,
          `×${p.count}`,
        ].filter(Boolean);
        return bits.join(" ");
      })
      .join("; ")
      .slice(0, 250)
  );

  const utm = input.utm || {};
  if (utm.utm_source) body.set("utm_source", utm.utm_source);
  if (utm.utm_medium) body.set("utm_medium", utm.utm_medium);
  if (utm.utm_term) body.set("utm_term", utm.utm_term);
  if (utm.utm_content) body.set("utm_content", utm.utm_content);
  if (utm.utm_campaign) body.set("utm_campaign", utm.utm_campaign);

  const notification = env("LP_CRM_NOTIFICATION");
  if (notification) body.set("notification", notification);

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: body.toString(),
      signal: AbortSignal.timeout(15_000),
    });

    const text = await res.text();
    let json: unknown = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }

    const status =
      json && typeof json === "object" && "status" in json
        ? String((json as { status: unknown }).status)
        : "";

    if (res.ok && status === "ok") {
      log.info(`Order ${input.siteOrderRef} → LP-CRM ${crmOrderId}`);
      return { ok: true, orderId: crmOrderId, raw: json };
    }

    const message =
      json && typeof json === "object" && "message" in json
        ? formatCrmMessage((json as { message: unknown }).message)
        : `HTTP ${res.status}: ${text.slice(0, 300)}`;

    log.warn(`LP-CRM reject for ${input.siteOrderRef}: ${message}`);
    return { ok: false, message, raw: json };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.warn(`LP-CRM request failed for ${input.siteOrderRef}: ${message}`);
    return { ok: false, message };
  }
}

/** Неблокуюча відправка (помилки лише в лог). */
export function enqueueLpCrmOrder(input: LpCrmOrderInput): void {
  void sendOrderToLpCrm(input).then((result) => {
    if (!result.ok && !result.skipped) {
      log.warn("LP-CRM enqueue failed:", result.message);
    }
  });
}
