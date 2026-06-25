import { NextRequest, NextResponse } from "next/server";
import { sqlGetAllOrders, sqlPostOrder } from "@/lib/sql";
import { getOrCreateOrderCustomer } from "@/lib/orderCustomer";
import { sendOrderConfirmationEmail } from "@/lib/orderConfirmationEmail";
import { sendOrderNotification } from "@/lib/telegram";
import { createLogger } from "@/lib/logger";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { ENABLE_ONLINE_CARD_PAYMENT } from "@/lib/paymentConfig";
import { computeOrderTotals, getBulkOrderDiscountAmount } from "@/lib/orderDiscounts";

const log = createLogger("POST /api/orders");

async function persistNovaPoshtaRefs(
  orderId: number,
  cityRef?: string | null,
  warehouseRef?: string | null
): Promise<void> {
  try {
    const { saveNovaPoshtaRefsToOrder } = await import("@/lib/createOrderTtn");
    await saveNovaPoshtaRefsToOrder(orderId, cityRef, warehouseRef);
  } catch (e) {
    log.warn(`Failed to save Nova Poshta refs for order ${orderId}:`, e);
  }
}

async function tryCreateOrderTtn(params: {
  orderId: number;
  customerName: string;
  phoneNumber: string;
  city: string;
  postOffice: string;
  cityRef?: string | null;
  warehouseRef?: string | null;
  deliveryMethod: string;
  orderTotal: number;
  orderItems: { productId: number; productName: string }[];
}): Promise<string | null> {
  try {
    const { createOrderTtn, saveTtnToOrder } = await import("@/lib/createOrderTtn");
    const ttnResult = await createOrderTtn(params);

    if ("ttn" in ttnResult) {
      await saveTtnToOrder(params.orderId, ttnResult.ttn);
      log.debug(`TTN ${ttnResult.ttn} created for order ${params.orderId}`);
      return ttnResult.ttn;
    }

    log.warn(`Failed to create TTN for order ${params.orderId}:`, ttnResult.error);
  } catch (e) {
    log.warn(`TTN creation failed for order ${params.orderId}:`, e);
  }
  return null;
}

type OrderTelegramContext = {
  dbOrderId: number;
  invoiceId: string;
  customer_name: string;
  phone_number: string;
  email?: string | null;
  delivery_method: string;
  city: string;
  post_office: string;
  comment?: string | null;
  payment_type: string;
  nova_poshta_ttn?: string | null;
  items: NormalizedOrderItem[];
  deliveryCost: number;
  bulkDiscountAmount: number;
  promoCode: string | null;
  promoDiscountAmount: number;
  orderTotal: number;
};

async function sendOrderTelegramNotification(params: OrderTelegramContext) {
  try {
    await sendOrderNotification(
      {
        id: params.dbOrderId,
        invoice_id: params.invoiceId,
        customer_name: params.customer_name,
        phone_number: params.phone_number,
        email: params.email || null,
        delivery_method: params.delivery_method,
        city: params.city,
        post_office: params.post_office,
        comment: params.comment ?? null,
        payment_type: params.payment_type,
        payment_status: "paid",
        status: null,
        nova_poshta_ttn: params.nova_poshta_ttn ?? null,
        delivery_cost: params.deliveryCost,
        loyalty_discount_amount:
          params.bulkDiscountAmount > 0 ? params.bulkDiscountAmount : null,
        promo_code: params.promoCode,
        promo_discount_amount:
          params.promoDiscountAmount > 0 ? params.promoDiscountAmount : null,
        order_total: params.orderTotal,
        items: params.items.map((item) => ({
          product_name: item.product_name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
        })),
        created_at: new Date(),
      },
      true
    );
  } catch (e) {
    log.warn("Telegram notification failed:", e);
  }
}

function buildOrderEmailPayload(params: OrderTelegramContext & {
  email: string;
  payment_type: string;
}) {
  return {
    customer_name: params.customer_name,
    email: params.email,
    phone_number: params.phone_number,
    delivery_method: params.delivery_method,
    city: params.city,
    post_office: params.post_office,
    payment_type: params.payment_type,
    comment: params.comment ?? null,
    invoice_id: params.invoiceId,
    nova_poshta_ttn: params.nova_poshta_ttn ?? null,
    created_at: new Date(),
    loyalty_discount_amount:
      params.bulkDiscountAmount > 0 ? params.bulkDiscountAmount : undefined,
    promo_code: params.promoCode,
    promo_discount_amount:
      params.promoDiscountAmount > 0 ? params.promoDiscountAmount : undefined,
    order_total: params.orderTotal,
    items: params.items.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
      color: item.color,
    })),
  };
}

type IncomingOrderItem = {
  product_id?: number | string;
  productId?: number | string;
  price: number | string;
  quantity: number | string;
  product_name?: string;
  name?: string;
  size: string | number;
  color?: string | null;
};

type NormalizedOrderItem = {
  product_id: number;
  product_name: string;
  size: string;
  quantity: number;
  price: number;
  color: string | null;
};

// ==========================
// GET /api/orders
// ==========================
export async function GET() {
  try {
    const orders = await sqlGetAllOrders();
    return NextResponse.json(orders);
  } catch (error) {
    log.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "Failed to fetch orders",
        ...(process.env.NODE_ENV === "development" && { details: message }),
      },
      { status: 500 }
    );
  }
}

// ==========================
// POST /api/orders
// ==========================
export async function POST(req: NextRequest) {
  try {
    log.debug("Starting order creation");
    const body = await req.json();
    log.debug("Received body:", JSON.stringify(body, null, 2));

    const one_click = body.one_click === true;

    let {
      user_id,
      customer_name,
      phone_number,
      email,
      delivery_method,
      city,
      post_office,
      comment,
      payment_type, // "full" або "prepay"
      items,
      promo_code: promoCodeFromBody,
      delivery_cost: deliveryCostFromBody,
      nova_poshta_city_ref: novaPoshtaCityRef,
      nova_poshta_warehouse_ref: novaPoshtaWarehouseRef,
    } = body;

    const npCityRef =
      typeof novaPoshtaCityRef === "string" ? novaPoshtaCityRef.trim() : "";
    const npWarehouseRef =
      typeof novaPoshtaWarehouseRef === "string" ? novaPoshtaWarehouseRef.trim() : "";

    if (one_click) {
      delivery_method = "one_click";
      city =
        typeof city === "string" && city.trim()
          ? city.trim()
          : "—";
      post_office =
        typeof post_office === "string" && post_office.trim()
          ? post_office.trim()
          : "Уточнити у менеджера (замовлення в 1 клік)";
      payment_type = "prepay";
      const tag = "Замовлення в 1 клік";
      comment =
        typeof comment === "string" && comment.trim()
          ? `${tag}. ${comment.trim()}`
          : tag;
    }

    // Глобально вимкнена онлайн-оплата: будь-який запит з "full" переводимо в накладений платіж.
    if (!ENABLE_ONLINE_CARD_PAYMENT && payment_type === "full") {
      payment_type = "prepay";
    }

    log.debug("Extracted data:", {
      customer_name,
      phone_number,
      email,
      delivery_method,
      city,
      post_office,
      payment_type,
      itemsCount: items?.length,
      one_click,
    });

    // ✅ Basic validation
    if (!customer_name || !phone_number || !items?.length) {
      log.warn("Validation failed:", {
        hasCustomerName: !!customer_name,
        hasPhoneNumber: !!phone_number,
        hasItems: !!items?.length,
      });
      return NextResponse.json(
        { error: "Missing required order fields" },
        { status: 400 }
      );
    }

    if (!one_click && (!delivery_method || !city || !post_office)) {
      log.warn("Validation failed:", {
        hasDeliveryMethod: !!delivery_method,
        hasCity: !!city,
        hasPostOffice: !!post_office,
      });
      return NextResponse.json(
        { error: "Missing required order fields" },
        { status: 400 }
      );
    }
    log.debug("Validation passed");

    const normalizedItems: NormalizedOrderItem[] = (items || []).map(
      (item: IncomingOrderItem, index: number) => {
        const productIdRaw = item.product_id ?? item.productId;
        const productId = Number(productIdRaw);
        if (!Number.isFinite(productId)) {
          throw new Error(
            `[POST /api/orders] Invalid product_id for item index ${index}`
          );
        }

        const price =
          typeof item.price === "string" ? Number(item.price) : item.price;
        if (!Number.isFinite(price)) {
          throw new Error(
            `[POST /api/orders] Invalid price for item index ${index}`
          );
        }

        const quantity =
          typeof item.quantity === "string"
            ? Number(item.quantity)
            : item.quantity;
        if (!Number.isFinite(quantity)) {
          throw new Error(
            `[POST /api/orders] Invalid quantity for item index ${index}`
          );
        }

        return {
          product_id: productId,
          product_name:
            item.product_name ||
            item.name ||
            `Товар #${productId}`,
          size: String(item.size),
          quantity,
          price,
          color: item.color ?? null,
        };
      }
    );

    // Check stock availability before creating order (inStock + product.stock)
    const { prisma } = await import("@/lib/prisma");
    const { canFulfillQuantity } = await import("@/lib/productAvailability");
    const stockChecks = await Promise.all(
      normalizedItems.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.product_id },
          select: { stock: true, inStock: true },
        });
        const availableStock =
          product?.inStock === true ? (product?.stock ?? 0) : 0;
        return {
          product_id: item.product_id,
          product_name: item.product_name,
          size: item.size,
          requested: item.quantity,
          available: availableStock,
          sufficient: canFulfillQuantity(
            { in_stock: product?.inStock, stock: product?.stock },
            item.quantity
          ),
        };
      })
    );

    const insufficientItems = stockChecks.filter((check) => !check.sufficient);
    if (insufficientItems.length > 0) {
      return NextResponse.json(
        {
          error:
            "Один або кілька товарів зараз недоступні. Оновіть кошик і спробуйте ще раз.",
        },
        { status: 400 }
      );
    }

    const subtotal = normalizedItems.reduce(
      (total: number, item) => total + item.price * item.quantity,
      0
    );
    const deliveryCost = one_click ? 0 : Number(deliveryCostFromBody) || 0;

    let promoCodeId: number | null = null;
    let promoDiscountAmount = 0;
    const promoCode = typeof promoCodeFromBody === "string" ? promoCodeFromBody.trim().toUpperCase() : "";
    if (promoCode) {
      const { prisma } = await import("@/lib/prisma");
      const promo = await prisma.promoCode.findUnique({ where: { code: promoCode } });
      if (promo) {
        const now = new Date();
        const validByDate = (!promo.validFrom || now >= promo.validFrom) && (!promo.validUntil || now <= promo.validUntil);
        const underLimit = promo.maxUses == null || promo.usedCount < promo.maxUses;
        if (validByDate && underLimit) {
          const value = Number(promo.value);
          const bulkDiscountBeforePromo = getBulkOrderDiscountAmount(subtotal);
          const amountBeforePromo = Math.max(
            0,
            subtotal - bulkDiscountBeforePromo + deliveryCost
          );
          if (promo.type === "percent") {
            promoDiscountAmount = Math.round((amountBeforePromo * value) / 100);
          } else {
            promoDiscountAmount = Math.min(value, amountBeforePromo);
          }
          if (promoDiscountAmount > 0) {
            promoCodeId = promo.id;
          }
        }
      }
    }

    const {
      bulkDiscountAmount,
      promoDiscountAmount: normalizedPromoDiscount,
      totalDiscountAmount,
      orderTotal,
    } = computeOrderTotals({
      subtotal,
      deliveryCost,
      promoDiscountAmount,
    });
    promoDiscountAmount = normalizedPromoDiscount;
    const amountToPay = orderTotal;
    const fullAmount = subtotal + deliveryCost;

    log.debug(" Amount calculation:", {
      fullAmount,
      bulkDiscountAmount,
      promoDiscountAmount,
      totalDiscountAmount,
      orderTotal,
      amountToPay,
      payment_type,
    });

    // Зберігаємо клієнта в таблиці users для адмінки та майбутніх розсилок
    let customerUserId: string | null = user_id || null;
    try {
      const createdOrExistingId = await getOrCreateOrderCustomer({
        customer_name,
        email: email || null,
        phone: phone_number,
        city,
        post_office,
      });
      customerUserId = createdOrExistingId;
    } catch (err) {
      log.warn("Failed to get/create order customer, order will have no user_id:", err);
    }

    const orderId = crypto.randomUUID();
    const isTestPayment = payment_type === "test_payment";
    const isPrepayCod = payment_type === "prepay";
    const PUBLIC_URL_FULL = process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";

    const orderPayload = {
      user_id: customerUserId,
      customer_name,
      phone_number,
      email,
      delivery_method,
      city,
      post_office,
      comment,
      payment_type,
      bonus_points_spent: 0,
      loyalty_discount_amount: bulkDiscountAmount > 0 ? bulkDiscountAmount : undefined,
      promo_code_id: promoCodeId ?? undefined,
      promo_discount_amount: promoDiscountAmount > 0 ? promoDiscountAmount : undefined,
      items: normalizedItems.map(
        ({ product_id, product_name, size, quantity, price, color }) => ({
          product_id,
          product_name,
          size,
          quantity,
          price,
          color,
        })
      ),
    };

    // Тест оплата — зберігаємо з orderId і редірект на успіх
    if (isTestPayment) {
      log.debug(" Saving order (test_payment)...");
      const { orderId: dbOrderId } = await sqlPostOrder({
        ...orderPayload,
        invoice_id: orderId,
        payment_status: "paid",
      });

      await persistNovaPoshtaRefs(dbOrderId, npCityRef, npWarehouseRef);
      const ttnNumber = await tryCreateOrderTtn({
        orderId: dbOrderId,
        customerName: customer_name,
        phoneNumber: phone_number,
        city,
        postOffice: post_office,
        cityRef: npCityRef || null,
        warehouseRef: npWarehouseRef || null,
        deliveryMethod: delivery_method,
        orderTotal: Math.round(orderTotal),
        orderItems: normalizedItems.map((i) => ({
          productId: i.product_id,
          productName: i.product_name,
        })),
      });

      // Лист підтвердження на email клієнта (як при реальній оплаті)
      if (email && String(email).trim()) {
        try {
          const productIds = [...new Set(normalizedItems.map((i) => i.product_id))];
          const mediaList = productIds.length > 0
            ? await prisma.productMedia.findMany({
                where: { productId: { in: productIds } },
                orderBy: [{ productId: "asc" }, { id: "asc" }],
                select: { productId: true, url: true },
              })
            : [];
          const productImageUrls = new Map<number, string>();
          const seen = new Set<number>();
          for (const m of mediaList) {
            if (seen.has(m.productId)) continue;
            seen.add(m.productId);
            const fullUrl = m.url.startsWith("http") ? m.url : `${PUBLIC_URL_FULL}/api/images/${m.url}`;
            productImageUrls.set(m.productId, fullUrl);
          }
          await sendOrderConfirmationEmail(
            buildOrderEmailPayload({
              dbOrderId,
              invoiceId: orderId,
              customer_name,
              phone_number,
              email: String(email).trim(),
              delivery_method,
              city,
              post_office,
              comment: comment ?? null,
              payment_type,
              nova_poshta_ttn: ttnNumber,
              items: normalizedItems,
              deliveryCost,
              bulkDiscountAmount,
              promoCode: promoCodeId ? promoCode : null,
              promoDiscountAmount,
              orderTotal,
            }),
            productImageUrls
          );
        } catch (e) {
          log.warn("Order confirmation email (test_payment) failed:", e);
        }
      }

      await sendOrderTelegramNotification({
        dbOrderId,
        invoiceId: orderId,
        customer_name,
        phone_number,
        email: email || null,
        delivery_method,
        city,
        post_office,
        comment: comment ?? null,
        payment_type: "test_payment",
        nova_poshta_ttn: ttnNumber,
        items: normalizedItems,
        deliveryCost,
        bulkDiscountAmount,
        promoCode: promoCodeId ? promoCode : null,
        promoDiscountAmount,
        orderTotal,
      });

      return NextResponse.json({
        success: true,
        orderId,
        invoiceUrl: `${PUBLIC_URL_FULL}/success?orderReference=${orderId}`,
      });
    }

    // Накладений платіж без онлайн-передоплати — одразу в БД, склад, Telegram, лист
    if (isPrepayCod) {
      log.debug(" Saving order (prepay, без онлайн-оплати)...");
      const { orderId: dbOrderId } = await sqlPostOrder({
        ...orderPayload,
        invoice_id: orderId,
        payment_status: "paid",
        decrement_stock: true,
      });

      await persistNovaPoshtaRefs(dbOrderId, npCityRef, npWarehouseRef);
      const ttnNumber = await tryCreateOrderTtn({
        orderId: dbOrderId,
        customerName: customer_name,
        phoneNumber: phone_number,
        city,
        postOffice: post_office,
        cityRef: npCityRef || null,
        warehouseRef: npWarehouseRef || null,
        deliveryMethod: delivery_method,
        orderTotal: Math.round(orderTotal),
        orderItems: normalizedItems.map((i) => ({
          productId: i.product_id,
          productName: i.product_name,
        })),
      });

      await sendOrderTelegramNotification({
        dbOrderId,
        invoiceId: orderId,
        customer_name,
        phone_number,
        email: email || null,
        delivery_method,
        city,
        post_office,
        comment: comment ?? null,
        payment_type: "prepay",
        nova_poshta_ttn: ttnNumber,
        items: normalizedItems,
        deliveryCost,
        bulkDiscountAmount,
        promoCode: promoCodeId ? promoCode : null,
        promoDiscountAmount,
        orderTotal,
      });

      if (email && String(email).trim()) {
        try {
          const productIds = [...new Set(normalizedItems.map((i) => i.product_id))];
          const mediaList =
            productIds.length > 0
              ? await prisma.productMedia.findMany({
                  where: { productId: { in: productIds } },
                  orderBy: [{ productId: "asc" }, { id: "asc" }],
                  select: { productId: true, url: true },
                })
              : [];
          const productImageUrls = new Map<number, string>();
          const seen = new Set<number>();
          for (const m of mediaList) {
            if (seen.has(m.productId)) continue;
            seen.add(m.productId);
            const fullUrl = m.url.startsWith("http") ? m.url : `${PUBLIC_URL_FULL}/api/images/${m.url}`;
            productImageUrls.set(m.productId, fullUrl);
          }
          await sendOrderConfirmationEmail(
            buildOrderEmailPayload({
              dbOrderId,
              invoiceId: orderId,
              customer_name,
              phone_number,
              email: String(email).trim(),
              delivery_method,
              city,
              post_office,
              comment: comment ?? null,
              payment_type: "prepay",
              nova_poshta_ttn: ttnNumber,
              items: normalizedItems,
              deliveryCost,
              bulkDiscountAmount,
              promoCode: promoCodeId ? promoCode : null,
              promoDiscountAmount,
              orderTotal,
            }),
            productImageUrls
          );
        } catch (e) {
          log.warn("Order confirmation email (prepay) failed:", e);
        }
      }

      return NextResponse.json({
        success: true,
        orderId,
        invoiceUrl: `${PUBLIC_URL_FULL}/success?orderReference=${orderId}`,
      });
    }

    // Оплата через Monobank (Mono)
    const monoToken = process.env.NEXT_PUBLIC_MONO_TOKEN;
    if (!monoToken) {
      log.error(" Missing NEXT_PUBLIC_MONO_TOKEN");
      return NextResponse.json(
        { error: "Не налаштовано оплату. Зв'яжіться з підтримкою." },
        { status: 500 }
      );
    }

    const amountInMinorUnits = Math.round(amountToPay * 100);

    // Monobank validates: amount === Σ(sum * qty) - discount.
    const basketOrder = [
      ...normalizedItems.map((item) => {
        const unitSum = Math.round(item.price * 100);
        const qty = Math.round(item.quantity);
        const lineTotal = unitSum * qty;
        return {
          name: item.color
            ? `${item.product_name} (${item.color})`
            : item.product_name,
          qty,
          sum: unitSum,
          total: lineTotal,
          unit: "шт.",
          code: item.color
            ? `${item.product_id}-${item.size}-${item.color}`
            : `${item.product_id}-${item.size}`,
        };
      }),
      ...(deliveryCost > 0
        ? [
            {
              name: "Доставка",
              qty: 1,
              sum: Math.round(deliveryCost * 100),
              total: Math.round(deliveryCost * 100),
              unit: "послуга",
              code: `delivery-${orderId}`,
            },
          ]
        : []),
    ];

    const totalDiscountMinorUnits = Math.round(totalDiscountAmount * 100);
    const invoicePayload = {
      amount: amountInMinorUnits,
      ccy: 980,
      merchantPaymInfo: {
        reference: orderId,
        destination: "Оплата замовлення",
        comment: comment || "Оплата замовлення",
        basketOrder,
        ...(totalDiscountMinorUnits > 0
          ? {
              discounts: [
                {
                  type: "DISCOUNT",
                  mode: "VALUE",
                  value: totalDiscountMinorUnits,
                },
              ],
            }
          : {}),
      },
      redirectUrl: `${PUBLIC_URL_FULL}/success?orderReference=${orderId}&monoRef=${orderId}`,
      webHookUrl: `${PUBLIC_URL_FULL}/api/mono-webhook`,
      validity: 3600,
      paymentType: "debit",
    };

    log.debug(" Creating Mono invoice...");
    const monoRes = await fetch("https://api.monobank.ua/api/merchant/invoice/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Token": monoToken,
      },
      body: JSON.stringify(invoicePayload),
    });

    const invoiceData = await monoRes.json();
    if (!monoRes.ok) {
      log.error(" Monobank error:", invoiceData);
      return NextResponse.json(
        {
          error: "Не вдалося створити рахунок для оплати. Спробуйте пізніше або зв'яжіться з нами.",
          details: invoiceData,
        },
        { status: 500 }
      );
    }

    const { invoiceId: monoInvoiceId, pageUrl } = invoiceData;
    if (!monoInvoiceId || !pageUrl) {
      log.error(" Monobank response missing invoiceId or pageUrl:", invoiceData);
      return NextResponse.json(
        { error: "Некоректна відповідь платіжної системи." },
        { status: 500 }
      );
    }

    log.debug(" Saving order with Mono invoice_id...");
    const { orderId: monoDbOrderId } = await sqlPostOrder({
      ...orderPayload,
      invoice_id: monoInvoiceId,
      merchant_reference: orderId,
      payment_status: "pending",
    });
    await persistNovaPoshtaRefs(monoDbOrderId, npCityRef, npWarehouseRef);

    return NextResponse.json({
      success: true,
      orderId: monoInvoiceId,
      invoiceUrl: pageUrl,
    });
  } catch (error) {
    log.error(" ERROR occurred:", error);
    log.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: "Failed to create order", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
