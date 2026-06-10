/**
 * Створення накладної Нової пошти для замовлення
 */

import {
  createNovaPoshtaTtn,
  isNovaPoshtaConfiguredForTtn,
  type CreateTtnParams,
} from "@/lib/nova-poshta";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";

const log = createLogger("createOrderTtn");

/**
 * Розрахунок габаритів посилки на основі розмірів товарів у замовленні.
 * Додаємо 15% до кожного виміру для упаковки.
 */
async function calculateParcelDimensions(orderItems: { productId: number | null }[]): Promise<{
  weight: string;
  volumeGeneral: string;
}> {
  const productIds = orderItems
    .map((i) => i.productId)
    .filter((id): id is number => id != null);

  if (productIds.length === 0) {
    return { weight: "1", volumeGeneral: "0.0004" };
  }

  // Отримуємо товари з БД (якщо у вас є поля width, height, depth у Product)
  // Наразі у схемі немає полів розмірів товару, тому використовуємо дефолтні значення
  // Якщо потрібно додати розміри товарів, додайте поля width, height, depth до Product моделі
  
  // Дефолтні розміри для невеликої дерев'яної сувенірної продукції (см):
  // Приблизно 20×15×5 см + 15% = 23×17.25×5.75
  const width = 23; // см
  const height = 17.25; // см
  const depth = 5.75; // см
  
  // Обчислюємо об'єм у м³
  const volumeM3 = (width * height * depth) / 1000000;
  
  // Вага для невеликих дерев'яних виробів (орієнтовно 0.3-0.5 кг на виріб)
  const weight = Math.max(1, Math.ceil(productIds.length * 0.4));

  return {
    weight: String(weight),
    volumeGeneral: volumeM3.toFixed(4),
  };
}

/**
 * Створює накладну Нової пошти для замовлення
 */
export async function createOrderTtn(params: {
  orderId: number;
  customerName: string;
  phoneNumber: string;
  city: string;
  postOffice: string;
  cityRef?: string | null;
  warehouseRef?: string | null;
  deliveryMethod: string;
  orderTotal: number;
  orderItems: { productId: number | null; productName: string | null }[];
}): Promise<{ ttn: string } | { error: string }> {
  const {
    orderId,
    customerName,
    phoneNumber,
    city,
    postOffice,
    cityRef,
    warehouseRef,
    deliveryMethod,
    orderTotal,
    orderItems,
  } = params;

  // Створюємо TTN тільки для доставки Новою поштою
  const isNovaPoshta = deliveryMethod.includes("nova_poshta");
  if (!isNovaPoshta) {
    log.debug(`Order ${orderId}: delivery method is ${deliveryMethod}, skipping TTN`);
    return { error: "Доставка не через Нову пошту" };
  }

  if (!isNovaPoshtaConfiguredForTtn()) {
    log.error(`Order ${orderId}: Nova Poshta TTN env is incomplete on this server`);
    return { error: "Nova Poshta не налаштована на сервері (перевірте .env)" };
  }

  try {
    const dimensions = await calculateParcelDimensions(orderItems);
    
    // Визначаємо тип сервісу на основі методу доставки
    let serviceType = "WarehouseWarehouse";
    if (deliveryMethod === "nova_poshta_courier") {
      serviceType = "WarehouseDoors";
    } else if (deliveryMethod === "nova_poshta_locker") {
      serviceType = "WarehouseWarehouse"; // Поштомат = відділення
    }

    const ttnParams: CreateTtnParams = {
      recipientName: customerName,
      recipientPhone: phoneNumber,
      cityName: city,
      warehouseDescription: postOffice,
      cityRef: cityRef ?? undefined,
      warehouseRef: warehouseRef ?? undefined,
      cost: orderTotal,
      description: process.env.NOVA_POSHTA_DESCRIPTION?.trim() || "Одяг",
      serviceType,
      weight: dimensions.weight,
      volumeGeneral: dimensions.volumeGeneral,
    };

    log.info(`Creating TTN for order ${orderId}`, {
      cityRef: cityRef ?? null,
      warehouseRef: warehouseRef ?? null,
      city,
      postOffice,
      deliveryMethod,
    });

    const result = await createNovaPoshtaTtn(ttnParams);

    if ("error" in result) {
      log.error(`Failed to create TTN for order ${orderId}:`, result.error, {
        hasCityRef: Boolean(cityRef?.trim()),
        hasWarehouseRef: Boolean(warehouseRef?.trim()),
      });
      return { error: result.error };
    }

    log.debug(`TTN created for order ${orderId}: ${result.ttn}`);
    return { ttn: result.ttn };
  } catch (error) {
    log.error(`Error creating TTN for order ${orderId}:`, error);
    return {
      error: error instanceof Error ? error.message : "Помилка створення ТТН",
    };
  }
}

/**
 * Зберігає TTN у замовленні
 */
export async function saveTtnToOrder(orderId: number, ttn: string): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: { novaPoshtaTtn: ttn },
  });
  log.debug(`TTN ${ttn} saved to order ${orderId}`);
}

export async function saveNovaPoshtaRefsToOrder(
  orderId: number,
  cityRef?: string | null,
  warehouseRef?: string | null
): Promise<void> {
  const city = cityRef?.trim() || null;
  const warehouse = warehouseRef?.trim() || null;
  if (!city && !warehouse) return;

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        novaPoshtaCityRef: city,
        novaPoshtaWarehouseRef: warehouse,
      },
    });
    log.debug(`Nova Poshta refs saved to order ${orderId}`);
  } catch (error) {
    log.warn(
      `Nova Poshta refs not saved for order ${orderId} (run npm run migrate on server?):`,
      error instanceof Error ? error.message : error
    );
  }
}
