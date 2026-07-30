/**
 * Серверні виклики API Нової Пошти (v2.0 JSON).
 * Ключ: NOVA_POSHTA_API_KEY (той самий тип ключа, що й для довідників).
 * Для створення ЕН потрібні реквізити відправника з особистого кабінету НП (refs).
 */

const NP_JSON = "https://api.novaposhta.ua/v2.0/json/";

export type NpCity = {
  ref: string;
  name: string;
};

export type NpWarehouse = {
  ref: string;
  description: string;
  number: string;
};

export type NpApiResponse<T> = {
  success: boolean;
  data?: T;
  errors?: string[];
  warnings?: string[];
  info?: unknown[];
};

function getApiKey(): string {
  return (
    process.env.NOVA_POSHTA_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_NOVA_POSHTA_API_KEY?.trim() ||
    ""
  );
}

function getRequiredApiKey(): string | undefined {
  const key = getApiKey();
  return key || undefined;
}

async function npDirectoryRequest<T>(
  modelName: string,
  calledMethod: string,
  methodProperties: Record<string, unknown>
): Promise<{ success: boolean; data: T[]; error?: string }> {
  try {
    const res = await fetch(NP_JSON, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: getApiKey(),
        modelName,
        calledMethod,
        methodProperties,
      }),
      cache: "no-store",
    });

    const json = (await res.json()) as {
      success: boolean;
      data?: T[];
      errors?: { message?: string }[] | string[];
    };

    if (!json.success) {
      const first = json.errors?.[0];
      const msg =
        typeof first === "string"
          ? first
          : (first as { message?: string } | undefined)?.message ??
            "Помилка API Нової Пошти";
      return { success: false, data: [], error: msg };
    }

    return { success: true, data: json.data ?? [] };
  } catch {
    return { success: false, data: [], error: "Не вдалося з'єднатися з API Нової Пошти" };
  }
}

/** Пошук міст для автодоповнення (ключ опційний). */
export async function searchNovaPoshtaCities(
  findByString: string,
  limit = 20
): Promise<{ cities: NpCity[]; error?: string }> {
  const query = findByString.trim();
  if (query.length < 2) return { cities: [] };

  const result = await npDirectoryRequest<{ Description: string; Ref: string }>(
    "Address",
    "getCities",
    { FindByString: query, Limit: limit }
  );

  if (!result.success) {
    return { cities: [], error: result.error ?? "Не вдалося завантажити міста" };
  }

  return {
    cities: result.data.map((c) => ({
      ref: c.Ref,
      name: c.Description,
    })),
  };
}

/** Відділення та поштомати в обраному місті (ключ опційний). */
export async function searchNovaPoshtaWarehouses(options: {
  cityRef?: string;
  cityName?: string;
  findByString?: string;
  limit?: number;
}): Promise<{ warehouses: NpWarehouse[]; error?: string }> {
  const cityRef = options.cityRef?.trim();
  const cityName = options.cityName?.trim();
  if (!cityRef && !cityName) {
    return { warehouses: [], error: "Оберіть місто" };
  }

  const methodProperties: Record<string, unknown> = {
    Limit: options.limit ?? 50,
  };

  if (cityRef) methodProperties.CityRef = cityRef;
  else methodProperties.CityName = cityName;

  const find = options.findByString?.trim();
  if (find) methodProperties.FindByString = find;

  const result = await npDirectoryRequest<{
    Description: string;
    Ref: string;
    Number?: string;
  }>("Address", "getWarehouses", methodProperties);

  if (!result.success) {
    return {
      warehouses: [],
      error: result.error ?? "Не вдалося завантажити відділення",
    };
  }

  return {
    warehouses: result.data.map((w) => ({
      ref: w.Ref,
      description: w.Description,
      number: w.Number ?? "",
    })),
  };
}

/** Телефон для НП: лише цифри, бажано 380… */
export function normalizeNpPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("0") && d.length === 10) return `38${d}`;
  if (d.startsWith("80") && d.length === 11) return `3${d}`;
  if (d.startsWith("380")) return d;
  return d;
}

/** Україна: постійний UTC+2 (без літнього часу з 2024). */
const KYIV_UTC_OFFSET_MS = 2 * 60 * 60 * 1000;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function getNovaPoshtaDescriptionFallback(): string {
  return process.env.NOVA_POSHTA_DESCRIPTION?.trim() || "Одяг";
}

/**
 * Дата відправки для InternetDocument.save — лише dd.mm.yyyy у київському календарі.
 * НП не приймає ISO і часто відхиляє формат з часом; UTC-дата на VPS дає «DateTime cannot be less then now».
 */
export function formatNovaPoshtaDateTime(now = new Date(), addDays = 0): string {
  const kyivMs = now.getTime() + KYIV_UTC_OFFSET_MS + addDays * 86_400_000;
  const kyiv = new Date(kyivMs);

  return `${pad2(kyiv.getUTCDate())}.${pad2(kyiv.getUTCMonth() + 1)}.${kyiv.getUTCFullYear()}`;
}

/**
 * НП приймає короткий опис кирилицею; назви товарів з латиницею/символами відхиляються.
 */
export function sanitizeNovaPoshtaDescription(input?: string | null): string {
  const raw = (input ?? "").trim();
  if (!raw) return getNovaPoshtaDescriptionFallback();

  const cleaned = raw
    .replace(/[^\u0400-\u04FF\u0456\u0457\u0490\u04B0\u04AE\u04E8\u04BA0-9\s,.()-]/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);

  const cyrillicLetters = cleaned.replace(/[^А-Яа-яІіЇїЄєҐґ]/g, "").length;
  if (cyrillicLetters < 3) return getNovaPoshtaDescriptionFallback();

  return cleaned;
}

function formatNpApiErrors(
  resp: NpApiResponse<unknown>
): string {
  const parts: string[] = [];

  for (const entry of resp.errors ?? []) {
    if (typeof entry === "string") parts.push(entry);
    else if (entry && typeof entry === "object" && "message" in entry) {
      parts.push(String((entry as { message?: string }).message));
    } else if (entry != null) {
      parts.push(JSON.stringify(entry));
    }
  }

  for (const entry of resp.warnings ?? []) {
    if (typeof entry === "string") parts.push(entry);
    else if (entry != null) parts.push(JSON.stringify(entry));
  }

  return parts.filter(Boolean).join("; ") || "Nova Poshta save failed";
}

async function npRequest<T>(
  modelName: string,
  calledMethod: string,
  methodProperties: Record<string, unknown>
): Promise<NpApiResponse<T>> {
  const apiKey = getRequiredApiKey();
  if (!apiKey) {
    return { success: false, errors: ["NOVA_POSHTA_API_KEY is not set"] };
  }

  const res = await fetch(NP_JSON, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      apiKey,
      modelName,
      calledMethod,
      methodProperties,
    }),
  });

  if (!res.ok) {
    return {
      success: false,
      errors: [`HTTP ${res.status}: ${res.statusText}`],
    };
  }

  return (await res.json()) as NpApiResponse<T>;
}

type NpCityRow = { Ref: string; Description: string };
type NpWarehouseRow = { Ref: string; Description: string; CityRef?: string };

async function resolveCityRefByName(cityName: string): Promise<string | null> {
  const name = cityName.trim();
  if (!name) return null;
  const resp = await npRequest<NpCityRow[]>("Address", "getCities", {
    FindByString: name,
    Limit: 20,
  });
  if (!resp.success || !resp.data?.length) return null;
  const exact =
    resp.data.find((c) => c.Description?.toLowerCase() === name.toLowerCase()) ??
    resp.data[0];
  return exact?.Ref ?? null;
}

async function resolveWarehouseRefByText(
  cityRef: string,
  warehouseText: string
): Promise<string | null> {
  const q = warehouseText.trim();
  if (!q) return null;
  const resp = await npRequest<NpWarehouseRow[]>("Address", "getWarehouses", {
    CityRef: cityRef,
    FindByString: q,
    Limit: 20,
  });
  if (!resp.success || !resp.data?.length) return null;
  const exact =
    resp.data.find((w) => w.Description?.toLowerCase() === q.toLowerCase()) ??
    resp.data[0];
  return exact?.Ref ?? null;
}

function splitFullName(fullName: string): {
  firstName: string;
  lastName: string;
  middleName: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "—", lastName: "—", middleName: "" };
  if (parts.length === 1) return { firstName: parts[0]!, lastName: parts[0]!, middleName: "" };
  if (parts.length === 2) return { firstName: parts[0]!, lastName: parts[1]!, middleName: "" };
  return {
    firstName: parts[0]!,
    lastName: parts[parts.length - 1]!,
    middleName: parts.slice(1, -1).join(" "),
  };
}

function normalizeNpNamePart(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function npPersonNamesMatch(
  expected: { firstName: string; lastName: string; middleName: string },
  actual: { FirstName?: string; LastName?: string; MiddleName?: string; Description?: string }
): boolean {
  const expectedFirst = normalizeNpNamePart(expected.firstName);
  const expectedLast = normalizeNpNamePart(expected.lastName);
  const actualFirst = normalizeNpNamePart(actual.FirstName);
  const actualLast = normalizeNpNamePart(actual.LastName);

  if (actualFirst && actualLast) {
    const direct =
      actualFirst === expectedFirst && actualLast === expectedLast;
    // Інколи в НП Ім'я/Прізвище поміняні місцями відносно нашого формату
    const swapped =
      actualFirst === expectedLast && actualLast === expectedFirst;
    if (direct || swapped) return true;
  }

  const description = normalizeNpNamePart(actual.Description);
  if (!description) return false;
  const expectedFull = [expected.lastName, expected.firstName, expected.middleName]
    .map(normalizeNpNamePart)
    .filter(Boolean)
    .join(" ");
  const expectedAlt = [expected.firstName, expected.lastName, expected.middleName]
    .map(normalizeNpNamePart)
    .filter(Boolean)
    .join(" ");
  return description === expectedFull || description === expectedAlt;
}

type NpContactPersonRow = {
  Ref?: string;
  FirstName?: string;
  LastName?: string;
  MiddleName?: string;
  Description?: string;
  Phones?: string;
};

type NpCounterpartySaveRow = {
  Ref?: string;
  FirstName?: string;
  LastName?: string;
  MiddleName?: string;
  Description?: string;
  ContactPerson?:
    | NpContactPersonRow[]
    | { data?: NpContactPersonRow[] }
    | string;
};

function extractContactPersonFromCounterparty(
  row: NpCounterpartySaveRow | undefined
): NpContactPersonRow | null {
  if (!row?.ContactPerson || typeof row.ContactPerson === "string") return null;
  const cp = row.ContactPerson;
  if (Array.isArray(cp)) {
    return (
      cp.find(
        (p): p is NpContactPersonRow =>
          !!p && typeof p === "object" && typeof p.Ref === "string"
      ) ?? null
    );
  }
  if (cp && typeof cp === "object" && Array.isArray(cp.data)) {
    return cp.data.find((p) => typeof p?.Ref === "string") ?? null;
  }
  return null;
}

async function resolveContactPersonRef(
  recipientRef: string,
  fromSave?: NpCounterpartySaveRow
): Promise<string | null> {
  const fromResponse = extractContactPersonFromCounterparty(fromSave)?.Ref;
  if (fromResponse) return fromResponse;

  const contactResp = await npRequest<NpContactPersonRow[]>(
    "Counterparty",
    "getCounterpartyContactPersons",
    { Ref: recipientRef }
  );
  return contactResp.data?.find((p) => p.Ref)?.Ref ?? null;
}

/**
 * НП за телефоном часто повертає вже існуючого отримувача з іншим ПІБ.
 * Ім'я на ТТН береться з ContactRecipient, тому синхронізуємо контрагента і контакт.
 */
async function ensureRecipientCounterparty(params: {
  fullName: string;
  phoneDigits: string;
  cityRef: string;
}): Promise<{ recipientRef: string; contactRef: string } | { error: string }> {
  const { firstName, lastName, middleName } = splitFullName(params.fullName);
  const nameProps = {
    FirstName: firstName,
    LastName: lastName,
    MiddleName: middleName,
    Phone: params.phoneDigits,
  };

  const saveResp = await npRequest<NpCounterpartySaveRow[]>("Counterparty", "save", {
    CounterpartyProperty: "Recipient",
    CounterpartyType: "PrivatePerson",
    CityRef: params.cityRef,
    ...nameProps,
  });

  const saved = saveResp.data?.[0];
  const recipientRef = saved?.Ref;
  if (!saveResp.success || !recipientRef) {
    return {
      error:
        (saveResp.errors ?? []).join("; ") ||
        "Не вдалося створити/отримати Recipient у НП",
    };
  }

  const savedContact = extractContactPersonFromCounterparty(saved);
  const namesAlreadyOk =
    npPersonNamesMatch({ firstName, lastName, middleName }, saved ?? {}) ||
    (savedContact
      ? npPersonNamesMatch({ firstName, lastName, middleName }, savedContact)
      : false);

  if (!namesAlreadyOk) {
    // Оновлюємо ПІБ існуючого отримувача (типовий кейс: той самий телефон, інше ім'я)
    await npRequest<NpCounterpartySaveRow[]>("Counterparty", "update", {
      Ref: recipientRef,
      CounterpartyProperty: "Recipient",
      CounterpartyType: "PrivatePerson",
      CityRef: params.cityRef,
      ...nameProps,
    });
  }

  let contactRef = await resolveContactPersonRef(recipientRef, saved);
  if (!contactRef) {
    return { error: "Не вдалося отримати ContactRecipient у НП" };
  }

  if (!namesAlreadyOk) {
    const contactUpdate = await npRequest<NpContactPersonRow[]>(
      "ContactPerson",
      "update",
      {
        Ref: contactRef,
        CounterpartyRef: recipientRef,
        FirstName: firstName,
        LastName: lastName,
        MiddleName: middleName || "",
        Phone: params.phoneDigits,
      }
    );

    if (!contactUpdate.success) {
      // Якщо оновлення заборонене (інколи для PrivatePerson) — створюємо контакт з потрібним ПІБ
      const contactSave = await npRequest<NpContactPersonRow[]>(
        "ContactPerson",
        "save",
        {
          CounterpartyRef: recipientRef,
          FirstName: firstName,
          LastName: lastName,
          MiddleName: middleName || "",
          Phone: params.phoneDigits,
        }
      );
      const createdRef = contactSave.data?.[0]?.Ref;
      if (contactSave.success && createdRef) {
        contactRef = createdRef;
      }
    }
  }

  return { recipientRef, contactRef };
}

export function isNovaPoshtaConfiguredForTtn(): boolean {
  const k = getRequiredApiKey();
  if (!k) return false;
  const sender = process.env.NOVA_POSHTA_SENDER_REF?.trim();
  const citySender = process.env.NOVA_POSHTA_CITY_SENDER_REF?.trim();
  const wh = process.env.NOVA_POSHTA_SENDER_WAREHOUSE_REF?.trim();
  const contact = process.env.NOVA_POSHTA_CONTACT_SENDER_REF?.trim();
  const phone = process.env.NOVA_POSHTA_SENDERS_PHONE?.trim();
  return !!(sender && citySender && wh && contact && phone);
}

export type CreateTtnParams = {
  recipientName: string;
  recipientPhone: string;
  /** Назва міста з довідника НП */
  cityName: string;
  /** Опис відділення / поштомату з довідника */
  warehouseDescription: string;
  /** Ref населеного пункту (getCities → Ref) — надійніше за назву */
  cityRef?: string | null;
  /** Ref відділення (getWarehouses → Ref) */
  warehouseRef?: string | null;
  /** Оціночна вартість, грн */
  cost: number;
  /** Текст накладної */
  description: string;
  /** WarehouseWarehouse | WarehouseDoors … */
  serviceType?: string;
  /** Вага посилки, кг (дефолт: 1) */
  weight?: string;
  /** Об'єм посилки, м³ (дефолт: 0.0004) */
  volumeGeneral?: string;
};

/** Результат InternetDocument.save — перший елемент data[] */
type SaveInternetDocumentRow = {
  IntDocNumber?: string;
  Ref?: string;
};

/**
 * Створює ЕН (ТТН) від відділення відправника до відділення отримувача.
 */
export async function createNovaPoshtaTtn(
  params: CreateTtnParams
): Promise<{ ttn: string; documentRef?: string } | { error: string }> {
  if (!isNovaPoshtaConfiguredForTtn()) {
    return {
      error:
        "NP TTN: задайте NOVA_POSHTA_API_KEY та NOVA_POSHTA_SENDER_REF, NOVA_POSHTA_CITY_SENDER_REF, NOVA_POSHTA_SENDER_WAREHOUSE_REF, NOVA_POSHTA_CONTACT_SENDER_REF, NOVA_POSHTA_SENDERS_PHONE",
    };
  }

  const senderPhone = normalizeNpPhone(process.env.NOVA_POSHTA_SENDERS_PHONE!);
  const recipientPhone = normalizeNpPhone(params.recipientPhone);

  const serviceType =
    params.serviceType ??
    (params.warehouseRef ? "WarehouseWarehouse" : "WarehouseWarehouse");

  // Якщо з фронта не прийшли Ref-и (користувач вводив руками) — резолвимо їх на сервері.
  const cityRef =
    params.cityRef?.trim() ||
    (await resolveCityRefByName(params.cityName).catch(() => null)) ||
    "";
  const warehouseRef =
    params.warehouseRef?.trim() ||
    (cityRef
      ? await resolveWarehouseRefByText(cityRef, params.warehouseDescription).catch(
          () => null
        )
      : null) ||
    "";

  if (!cityRef || !warehouseRef) {
    return {
      error:
        "CityRecipient not selected; RecipientAddress not selected (не вдалося визначити Ref міста/відділення). Виберіть місто/відділення зі списку або перевірте дані.",
    };
  }

  const ensured = await ensureRecipientCounterparty({
    fullName: params.recipientName,
    phoneDigits: recipientPhone,
    cityRef,
  });
  if ("error" in ensured) return { error: ensured.error };

  const descriptionCandidates = [
    sanitizeNovaPoshtaDescription(params.description),
    getNovaPoshtaDescriptionFallback(),
    "Товари",
    "Вантаж",
  ].filter((value, index, list) => list.indexOf(value) === index);

  const baseProperties: Record<string, unknown> = {
    Sender: process.env.NOVA_POSHTA_SENDER_REF,
    CitySender: process.env.NOVA_POSHTA_CITY_SENDER_REF,
    SenderAddress: process.env.NOVA_POSHTA_SENDER_WAREHOUSE_REF,
    ContactSender: process.env.NOVA_POSHTA_CONTACT_SENDER_REF,
    SendersPhone: senderPhone,
    RecipientsPhone: recipientPhone,
    RecipientName: params.recipientName.trim(),
    ServiceType: serviceType,
    PaymentMethod: process.env.NOVA_POSHTA_PAYMENT_METHOD?.trim() || "Cash",
    PayerType: process.env.NOVA_POSHTA_PAYER_TYPE?.trim() || "Recipient",
    Cost: String(Math.max(1, Math.round(params.cost))),
    SeatsAmount: "1",
    CargoType: process.env.NOVA_POSHTA_CARGO_TYPE?.trim() || "Parcel",
    Weight: params.weight ?? "1",
    VolumeGeneral: params.volumeGeneral ?? "0.0004",
    Recipient: ensured.recipientRef,
    ContactRecipient: ensured.contactRef,
    CityRecipient: cityRef,
    RecipientAddress: warehouseRef,
  };

  let lastError = "Nova Poshta save failed";

  for (let dayOffset = 0; dayOffset <= 1; dayOffset += 1) {
    for (const description of descriptionCandidates) {
      const methodProperties: Record<string, unknown> = {
        ...baseProperties,
        Description: description,
        DateTime: formatNovaPoshtaDateTime(new Date(), dayOffset),
      };

      const resp = await npRequest<SaveInternetDocumentRow[]>(
        "InternetDocument",
        "save",
        methodProperties
      );

      if (resp.success && resp.data?.[0]) {
        const row = resp.data[0];
        const ttn = row.IntDocNumber?.replace(/\D/g, "") ?? "";
        if (!ttn) {
          lastError = "NP відповідь без номера ТТН";
          continue;
        }
        return { ttn, documentRef: row.Ref };
      }

      lastError = formatNpApiErrors(resp);
      const lower = lastError.toLowerCase();
      const retryDescription = lower.includes("description");
      const retryDateTime = lower.includes("datetime");

      if (!retryDescription && !retryDateTime) {
        return { error: lastError };
      }
    }
  }

  return { error: lastError };
}

export type TrackingRow = {
  Number?: string;
  Status?: string;
  StatusCode?: string;
  WarehouseRecipient?: string;
  ScheduledDeliveryDate?: string;
};

/**
 * Статус доставки за номером ТТН (для кабінету).
 */
export async function getNovaPoshtaTracking(
  ttn: string,
  recipientPhone?: string | null
): Promise<{ code: string | null; name: string | null; raw?: TrackingRow } | null> {
  const clean = ttn.replace(/\D/g, "");
  if (!clean) return null;

  const doc: { DocumentNumber: string; Phone?: string } = {
    DocumentNumber: clean,
  };
  if (recipientPhone) {
    doc.Phone = normalizeNpPhone(recipientPhone);
  }

  const tryModels = ["TrackingDocument", "TrackingDocumentGeneral"] as const;
  for (const modelName of tryModels) {
    const resp = await npRequest<TrackingRow[]>(modelName, "getStatusDocuments", {
      Documents: [doc],
    });
    if (resp.success && resp.data?.[0]) {
      const r = resp.data[0];
      return {
        code: r.StatusCode ?? null,
        name: r.Status ?? null,
        raw: r,
      };
    }
  }
  return null;
}
