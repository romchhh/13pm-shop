const NP_API_URL = "https://api.novaposhta.ua/v2.0/json/";

export type NpCity = {
  ref: string;
  name: string;
};

export type NpWarehouse = {
  ref: string;
  description: string;
  number: string;
};

/** Ключ опційний: getCities / getWarehouses працюють і з порожнім apiKey. */
function getApiKey(): string {
  return (
    process.env.NOVA_POSHTA_API_KEY ||
    process.env.NEXT_PUBLIC_NOVA_POSHTA_API_KEY ||
    ""
  ).trim();
}

async function novaPoshtaRequest<T>(
  modelName: string,
  calledMethod: string,
  methodProperties: Record<string, unknown>
): Promise<{ success: boolean; data: T[]; error?: string }> {
  try {
    const res = await fetch(NP_API_URL, {
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
      errors?: { message?: string }[];
    };

    if (!json.success) {
      const msg = json.errors?.[0]?.message ?? "Помилка API Нової Пошти";
      return { success: false, data: [], error: msg };
    }

    return { success: true, data: json.data ?? [] };
  } catch {
    return { success: false, data: [], error: "Не вдалося з'єднатися з API Нової Пошти" };
  }
}

/** Пошук міст для автодоповнення */
export async function searchNovaPoshtaCities(
  findByString: string,
  limit = 20
): Promise<{ cities: NpCity[]; error?: string }> {
  const query = findByString.trim();
  if (query.length < 2) return { cities: [] };

  const result = await novaPoshtaRequest<{ Description: string; Ref: string }>(
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

/** Відділення та поштомати в обраному місті */
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

  const result = await novaPoshtaRequest<{
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
