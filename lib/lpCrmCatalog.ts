/**
 * LP-CRM catalog / sites API.
 *
 * Вхідний ключ (LP_CRM_API_KEY) — лише addNewOrder.
 * Каталог і сайти потребують вихідного ключа (LP_CRM_OUTGOING_API_KEY)
 * з Налаштування → Система в кабінеті vividmotor.lp-crm.biz.
 */

import { createLogger } from "@/lib/logger";

const log = createLogger("lp-crm-catalog");

export type LpCrmCatalogProduct = {
  id: number;
  name: string;
  price?: number | string | null;
  article?: string | null;
  raw?: unknown;
};

export type LpCrmApiResult<T = unknown> =
  | { ok: true; data: T; raw: unknown }
  | { ok: false; message: string; raw?: unknown };

function env(name: string): string {
  return (process.env[name] || "").trim();
}

export function lpCrmApiBase(): string {
  const fromUrl = env("LP_CRM_API_URL");
  if (fromUrl) {
    try {
      const u = new URL(fromUrl);
      return `${u.origin}/api`;
    } catch {
      /* fall through */
    }
  }
  return "https://vividmotor.lp-crm.biz/api";
}

/** Вихідний ключ; якщо немає — пробуємо вхідний (на старих кабінетах іноді один). */
export function lpCrmCatalogKey(): string {
  return env("LP_CRM_OUTGOING_API_KEY") || env("LP_CRM_API_KEY");
}

export function isLpCrmCatalogConfigured(): boolean {
  return Boolean(lpCrmCatalogKey());
}

async function postCrm(
  endpoint: string,
  fields: Record<string, string | number | undefined | null>
): Promise<LpCrmApiResult> {
  const key = lpCrmCatalogKey();
  if (!key) {
    return {
      ok: false,
      message:
        "Немає LP_CRM_OUTGOING_API_KEY (вихідний ключ з Налаштування → Система)",
    };
  }

  const body = new URLSearchParams();
  body.set("key", key);
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null || v === "") continue;
    body.set(k, String(v));
  }

  const url = `${lpCrmApiBase()}/${endpoint.replace(/^\//, "")}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: body.toString(),
      signal: AbortSignal.timeout(20_000),
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
    const message =
      json && typeof json === "object" && "message" in json
        ? formatMessage((json as { message: unknown }).message)
        : `HTTP ${res.status}`;

    if (res.ok && (status === "ok" || status === "success" || status === "")) {
      const data =
        json && typeof json === "object" && "data" in json
          ? (json as { data: unknown }).data
          : json;
      return { ok: true, data, raw: json };
    }

    // Деякі ендпоінти повертають масив без status
    if (res.ok && Array.isArray(json)) {
      return { ok: true, data: json, raw: json };
    }

    return { ok: false, message: message || `HTTP ${res.status}`, raw: json };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.warn(`${endpoint} failed:`, message);
    return { ok: false, message };
  }
}

function formatMessage(message: unknown): string {
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.map(String).join("; ");
  if (message == null) return "";
  return String(message);
}

function normalizeProducts(data: unknown): LpCrmCatalogProduct[] {
  const list = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as { products?: unknown }).products)
      ? ((data as { products: unknown[] }).products)
      : data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data)
        ? ((data as { data: unknown[] }).data)
        : [];

  const out: LpCrmCatalogProduct[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const id = Number(row.id ?? row.product_id ?? row.ID);
    if (!Number.isFinite(id) || id <= 0) continue;
    out.push({
      id,
      name: String(row.name ?? row.product_name ?? row.title ?? `Product #${id}`),
      price: (row.price as string | number | null | undefined) ?? null,
      article: (row.article as string | null | undefined) ?? null,
      raw: item,
    });
  }
  return out;
}

export async function getLpCrmProducts(): Promise<
  LpCrmApiResult<LpCrmCatalogProduct[]>
> {
  const result = await postCrm("getProducts.html", {});
  if (!result.ok) return result;
  return { ok: true, data: normalizeProducts(result.data), raw: result.raw };
}

export type AddLpCrmProductInput = {
  name: string;
  price: number;
  article?: string | null;
  category?: string | null;
  /** Якщо CRM дозволяє — спроба задати id */
  productId?: number | null;
};

export async function addLpCrmProduct(
  input: AddLpCrmProductInput
): Promise<LpCrmApiResult<{ id?: number }>> {
  const fields: Record<string, string | number | undefined | null> = {
    name: input.name,
    product_name: input.name,
    title: input.name,
    price: input.price,
    product_price: input.price,
  };
  if (input.article) {
    fields.article = input.article;
    fields.sku = input.article;
  }
  if (input.category) fields.category = input.category;
  if (input.productId && input.productId > 0) {
    fields.id = input.productId;
    fields.product_id = input.productId;
  }

  // Основний ендпоінт; якщо кабінет має інший — пробуємо запасні
  const endpoints = ["addProduct.html", "createProduct.html", "saveProduct.html"];
  let last: LpCrmApiResult = { ok: false, message: "no endpoint tried" };

  for (const ep of endpoints) {
    const result = await postCrm(ep, fields);
    last = result;
    if (!result.ok) {
      // ключ не підходить / ендпоінт не той — далі
      const msg = result.message.toLowerCase();
      if (msg.includes("ключ") || msg.includes("key") || msg.includes("не найден")) {
        return result;
      }
      continue;
    }

    const id = extractCreatedId(result.data ?? result.raw);
    log.info(`Created CRM product "${input.name}" → ${id ?? "?"}`);
    return { ok: true, data: { id }, raw: result.raw };
  }

  return last.ok
    ? { ok: true, data: { id: extractCreatedId(last.raw) }, raw: last.raw }
    : last;
}

function extractCreatedId(data: unknown): number | undefined {
  if (!data || typeof data !== "object") return undefined;
  const row = data as Record<string, unknown>;
  const candidates = [
    row.id,
    row.product_id,
    row.productId,
    Array.isArray(row.data) && row.data[0] && typeof row.data[0] === "object"
      ? (row.data[0] as Record<string, unknown>).id
      : undefined,
    row.data && typeof row.data === "object"
      ? (row.data as Record<string, unknown>).id
      : undefined,
  ];
  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return undefined;
}

export type AddLpCrmSiteInput = {
  host: string;
  name?: string;
  url?: string;
};

/**
 * Реєстрація сайту/лендінгу в CRM (щоб не було ERROR SITE NAME).
 */
export async function addLpCrmSite(
  input: AddLpCrmSiteInput
): Promise<LpCrmApiResult> {
  const host = input.host.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const url = input.url || `https://${host}/`;
  const name = input.name || host;

  const fields = {
    name,
    site: name,
    site_name: name,
    domain: host,
    host,
    url,
    link: url,
    HTTP_HOST: host,
  };

  const endpoints = [
    "addSite.html",
    "createSite.html",
    "saveSite.html",
    "addLanding.html",
  ];

  let last: LpCrmApiResult = { ok: false, message: "no endpoint tried" };
  for (const ep of endpoints) {
    const result = await postCrm(ep, fields);
    last = result;
    if (!result.ok) {
      const msg = result.message.toLowerCase();
      if (msg.includes("ключ") || msg.includes("key") || msg.includes("не найден")) {
        return result;
      }
      continue;
    }
    log.info(`Registered CRM site ${host}`);
    return result;
  }
  return last;
}
