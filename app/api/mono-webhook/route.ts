import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderNotification } from "@/lib/telegram";
import { sendOrderConfirmationEmail } from "@/lib/orderConfirmationEmail";
import { summarizeOrderAmounts } from "@/lib/orderAmounts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Monobank надсилає POST при зміні статусу рахунку.
 * Тіло: { invoiceId, status, modifiedDate, ... }.
 * При status === "success" оновлюємо замовлення на paid та зменшуємо склад.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const invoiceId = body.invoiceId as string | undefined;
    const status = body.status as string | undefined;

    if (!invoiceId) {
      return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 });
    }

    if (status !== "success") {
      return NextResponse.json({ received: true });
    }

    const order = await prisma.order.findFirst({
      where: { invoiceId },
      include: {
        promoCode: { select: { code: true } },
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });

    if (!order) {
      console.warn("[Mono webhook] Order not found for invoiceId:", invoiceId);
      return NextResponse.json({ received: true });
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json({ received: true });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: "paid" },
      });
      for (const item of order.items) {
        if (item.productId == null) continue;
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, inStock: true },
        });
        if (
          product &&
          product.inStock === true &&
          product.stock >= item.quantity
        ) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }
    });

    // Створюємо TTN для Нової пошти
    let ttnNumber: string | null = null;
    try {
      const { createOrderTtn, saveTtnToOrder } = await import("@/lib/createOrderTtn");
      const orderTotal = order.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
      );
      const ttnResult = await createOrderTtn({
        orderId: order.id,
        customerName: order.customerName,
        phoneNumber: order.phoneNumber,
        city: order.city,
        postOffice: order.postOffice,
        cityRef: order.novaPoshtaCityRef,
        warehouseRef: order.novaPoshtaWarehouseRef,
        deliveryMethod: order.deliveryMethod,
        orderTotal: Math.round(orderTotal),
        orderItems: order.items.map((i) => ({
          productId: i.productId,
          productName: i.productName ?? i.product?.name ?? null,
        })),
      });

      if ("ttn" in ttnResult) {
        ttnNumber = ttnResult.ttn;
        await saveTtnToOrder(order.id, ttnNumber);
        console.log(`[Mono webhook] TTN ${ttnNumber} created for order ${order.id}`);
      } else {
        console.warn(`[Mono webhook] Failed to create TTN for order ${order.id}:`, ttnResult.error);
      }
    } catch (e) {
      console.warn("[Mono webhook] TTN creation failed:", e);
    }

    try {
      const items = order.items.map((item) => ({
        product_name: item.productName ?? item.product?.name ?? "Товар",
        size: item.size,
        quantity: item.quantity,
        price: Number(item.price),
        color: item.color,
      }));
      const amounts = summarizeOrderAmounts({
        items,
        loyaltyDiscountAmount: order.loyaltyDiscountAmount
          ? Number(order.loyaltyDiscountAmount)
          : 0,
        promoDiscountAmount: order.promoDiscountAmount
          ? Number(order.promoDiscountAmount)
          : 0,
      });

      await sendOrderNotification(
        {
          id: order.id,
          invoice_id: order.invoiceId,
          customer_name: order.customerName,
          phone_number: order.phoneNumber,
          email: order.email,
          delivery_method: order.deliveryMethod,
          city: order.city,
          post_office: order.postOffice,
          comment: order.comment,
          payment_type: order.paymentType,
          payment_status: "paid",
          status: order.status,
          nova_poshta_ttn: ttnNumber,
          loyalty_discount_amount: amounts.bulkDiscountAmount || null,
          promo_code: order.promoCode?.code ?? null,
          promo_discount_amount: amounts.promoDiscountAmount || null,
          order_total: amounts.orderTotal,
          items,
          created_at: order.createdAt,
        },
        true
      );
    } catch (e) {
      console.error("[Mono webhook] Telegram error:", e);
    }

    // Лист підтвердження на email клієнта (HTML з подякою, деталями, товарами, соцмережами)
    if (order.email && order.email.trim()) {
      try {
        const productIds = [...new Set(order.items.map((i) => i.productId).filter((id): id is number => id != null))];
        const mediaList = productIds.length > 0
          ? await prisma.productMedia.findMany({
              where: { productId: { in: productIds } },
              orderBy: [{ productId: "asc" }, { id: "asc" }],
              select: { productId: true, url: true },
            })
          : [];
        const baseUrl = process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "";
        const productImageUrls = new Map<number, string>();
        const seen = new Set<number>();
        for (const m of mediaList) {
          if (seen.has(m.productId)) continue;
          seen.add(m.productId);
          const fullUrl = m.url.startsWith("http") ? m.url : `${baseUrl}/api/images/${m.url}`;
          productImageUrls.set(m.productId, fullUrl);
        }
        await sendOrderConfirmationEmail(
          {
            customer_name: order.customerName,
            email: order.email,
            phone_number: order.phoneNumber,
            delivery_method: order.deliveryMethod,
            city: order.city,
            post_office: order.postOffice,
            payment_type: order.paymentType,
            comment: order.comment,
            invoice_id: order.invoiceId,
            nova_poshta_ttn: ttnNumber,
            created_at: order.createdAt,
            items: order.items.map((item) => ({
              product_id: item.productId,
              product_name: item.productName ?? item.product?.name ?? null,
              size: item.size,
              quantity: item.quantity,
              price: Number(item.price),
              color: item.color,
            })),
          },
          productImageUrls
        );
      } catch (e) {
        console.error("[Mono webhook] Order confirmation email error:", e);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Mono webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
