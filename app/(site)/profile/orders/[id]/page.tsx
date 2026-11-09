"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  size: string;
  color: string | null;
  product: {
    id: number;
    name: string;
    imageUrl?: string | null;
  } | null;
}

interface Order {
  id: number;
  customerName: string;
  phoneNumber: string;
  email: string | null;
  deliveryMethod: string;
  city: string;
  postOffice: string;
  comment: string | null;
  paymentType: string;
  paymentStatus: string;
  novaPoshtaTtn?: string | null;
  npStatusCode?: string | null;
  npStatusName?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    if (!session?.user || !id) return;

    fetch(`/api/users/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Замовлення не знайдено");
        return res.json();
      })
      .then(setOrder)
      .catch(() => setError("Замовлення не знайдено"))
      .finally(() => setLoading(false));
  }, [session, status, id, router]);

  const panelClass =
    "rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] sm:p-6";
  const btnPrimary =
    "inline-flex items-center justify-center min-h-[3.25rem] rounded-2xl bg-[#1C1C1C] px-6 py-3.5 font-['Montserrat'] text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-black";
  const btnGhost =
    "inline-flex items-center justify-center min-h-[44px] rounded-2xl border border-[#1C1C1C] px-5 py-2.5 font-['Montserrat'] text-xs font-bold uppercase tracking-[0.12em] text-[#1C1C1C] transition-colors hover:bg-[#1C1C1C] hover:text-white";

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#faf9f7]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-black/10 border-t-[#1C1C1C] rounded-full animate-spin" />
          <p className="font-['Montserrat'] text-sm text-black/60">Завантаження…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#faf9f7] pt-10 pb-16 px-4 sm:px-6 lg:px-12">
        <div className={`mx-auto max-w-2xl ${panelClass} py-14 text-center`}>
          <p className="text-black/60 font-['Montserrat'] text-sm mb-6">
            {error || "Замовлення не знайдено"}
          </p>
          <Link href="/profile?tab=orders" className={btnPrimary}>
            Назад до замовлень
          </Link>
        </div>
      </div>
    );
  }

  const total = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const deliveryLabel =
    order.deliveryMethod === "nova_poshta_branch"
      ? "Нова пошта (відділення)"
      : order.deliveryMethod === "nova_poshta_courier"
        ? "Нова пошта (кур'єр)"
        : order.deliveryMethod === "nova_poshta_locker"
          ? "Нова пошта (поштомат)"
          : order.deliveryMethod === "showroom_pickup"
            ? "Самовивіз"
            : order.deliveryMethod;

  const paymentLabel =
    order.paymentType === "full"
      ? "Повна оплата"
      : order.paymentType === "prepay"
        ? "Передоплата 200 грн"
        : order.paymentType === "pay_after"
          ? "Оплата після (при отриманні)"
          : order.paymentType === "test_payment"
            ? "Тест оплата"
            : order.paymentType === "installment"
              ? "В розстрочку"
              : order.paymentType === "crypto"
                ? "Криптовалюта"
                : order.paymentType;

  const paymentStatusLabel =
    order.paymentStatus === "paid"
      ? "Оплачено"
      : order.paymentStatus === "canceled"
        ? "Скасовано"
        : "Очікує оплати";

  const paymentStatusClass =
    order.paymentStatus === "paid"
      ? "text-[var(--site-accent,#5A6B47)]"
      : order.paymentStatus === "canceled"
        ? "text-red-700"
        : "text-amber-800";

  return (
    <div className="min-h-screen bg-[#faf9f7] pt-8 sm:pt-10 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/profile?tab=orders"
          className="inline-flex items-center gap-2 text-black/50 hover:text-[#1C1C1C] font-['Montserrat'] text-sm mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          До замовлень
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold font-['Montserrat'] tracking-tight text-[#1C1C1C] mb-2">
          Замовлення #{order.id}
        </h1>
        <p className="text-black/55 font-['Montserrat'] text-sm mb-6 sm:mb-8">
          {new Date(order.createdAt).toLocaleDateString("uk-UA", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        <div className="space-y-4">
          <section className={panelClass}>
            <h2 className="text-sm font-['Montserrat'] font-semibold text-black/50 mb-4">
              Товари
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => {
                const subtotal = Number(item.price) * item.quantity;
                return (
                  <div
                    key={item.id}
                    className="flex gap-3 sm:gap-4 pb-4 border-b border-black/[0.06] last:border-0 last:pb-0"
                  >
                    <Link
                      href={item.product ? `/product/${item.product.id}` : "/catalog"}
                      className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#f5f5f4]"
                    >
                      {item.product?.imageUrl ? (
                        <Image
                          src={`/api/images/${item.product.imageUrl}`}
                          alt={item.product?.name || "Товар"}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-black/30 text-[10px]">Фото</span>
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0 font-['Montserrat']">
                      {item.product ? (
                        <Link
                          href={`/product/${item.product.id}`}
                          className="text-sm font-medium text-[#1C1C1C] hover:opacity-70 transition-opacity"
                        >
                          {item.product.name}
                        </Link>
                      ) : (
                        <span className="text-sm">Товар</span>
                      )}
                      <p className="mt-1 text-xs text-black/50">
                        {[item.size, item.color].filter(Boolean).join(" · ") || "—"}
                        {" · "}×{item.quantity}
                      </p>
                      <p className="mt-2 text-sm font-semibold tabular-nums text-[#1C1C1C]">
                        {subtotal.toFixed(0)} грн
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 pt-4 border-t border-black/[0.06] flex justify-between font-['Montserrat']">
              <span className="text-sm text-black/50 self-center">Разом</span>
              <span className="text-lg font-semibold tabular-nums text-[#1C1C1C]">
                {total.toFixed(0)} грн
              </span>
            </div>
          </section>

          <section className={panelClass}>
            <h2 className="text-sm font-['Montserrat'] font-semibold text-black/50 mb-4">
              Отримувач та доставка
            </h2>
            <dl className="space-y-3 font-['Montserrat'] text-sm">
              {[
                ["Ім'я", order.customerName],
                ["Телефон", order.phoneNumber],
                ...(order.email ? [["Email", order.email] as const] : []),
                ["Доставка", deliveryLabel],
                ["Місто", order.city],
                ["Відділення", order.postOffice],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="grid grid-cols-[7rem_1fr] gap-3"
                >
                  <dt className="text-black/45">{label}</dt>
                  <dd className="text-[#1C1C1C] break-words">{value}</dd>
                </div>
              ))}
              {order.comment ? (
                <div className="pt-3 border-t border-black/[0.06]">
                  <dt className="text-black/45 mb-1">Коментар</dt>
                  <dd className="text-black/80">{order.comment}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          {order.novaPoshtaTtn ? (
            <section className={panelClass}>
              <h2 className="text-sm font-['Montserrat'] font-semibold text-black/50 mb-4">
                Нова пошта
              </h2>
              <dl className="space-y-3 font-['Montserrat'] text-sm">
                <div className="grid grid-cols-[7rem_1fr] gap-3">
                  <dt className="text-black/45">ТТН</dt>
                  <dd className="font-mono text-xs sm:text-sm break-all text-[#1C1C1C]">
                    {order.novaPoshtaTtn}
                  </dd>
                </div>
                {(order.npStatusName || order.npStatusCode) && (
                  <div className="grid grid-cols-[7rem_1fr] gap-3">
                    <dt className="text-black/45">Статус</dt>
                    <dd className="text-[#1C1C1C]">
                      {order.npStatusName || "—"}
                      {order.npStatusCode ? (
                        <span className="text-black/40 ml-1">({order.npStatusCode})</span>
                      ) : null}
                    </dd>
                  </div>
                )}
              </dl>
              <a
                href={`https://novaposhta.ua/tracking/${order.novaPoshtaTtn}`}
                target="_blank"
                rel="noreferrer"
                className={`${btnGhost} mt-5`}
              >
                Відстежити посилку
              </a>
            </section>
          ) : null}

          <section className={panelClass}>
            <h2 className="text-sm font-['Montserrat'] font-semibold text-black/50 mb-4">
              Оплата
            </h2>
            <p className="font-['Montserrat'] text-sm text-[#1C1C1C]">{paymentLabel}</p>
            <p className={`font-['Montserrat'] text-sm mt-2 font-semibold ${paymentStatusClass}`}>
              {paymentStatusLabel}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
