"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useBasket } from "@/lib/BasketProvider";
import { getItemSubtotal } from "@/lib/pricing";
import CartLineItems from "@/components/cart/CartLineItems";
import CartRecommendations from "@/components/cart/CartRecommendations";

const ACCENT = "#8B5E3F";

function getSubtotal(
  items: {
    price: number;
    quantity: number;
    discount_percentage?: number | null;
  }[]
) {
  return items.reduce(
    (sum, item) => sum + getItemSubtotal(item.price, item.quantity, item.discount_percentage),
    0
  );
}

export default function CartPageClient() {
  const { items, clearBasket } = useBasket();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = getSubtotal(items);
  const deliveryLabel = "За тарифами перевізника";
  const total = subtotal;

  if (!mounted) {
    return (
      <div className="min-h-[40vh] bg-white pt-32 font-['Montserrat'] text-black/50">
        Завантаження...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] pb-16 pt-6 lg:pb-20">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-12">
        <nav className="mb-4 font-['Montserrat'] text-sm text-black/45" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
            <li>
              <Link href="/" className="hover:text-[#8B5E3F]">
                Головна
              </Link>
            </li>
            <li className="text-black/30" aria-hidden>
              &gt;
            </li>
            <li className="text-black/70">Кошик</li>
          </ol>
        </nav>

        <h1 className="mb-6 font-['Montserrat'] text-2xl font-semibold capitalize text-black sm:text-3xl lg:text-4xl">
          Ваш кошик
        </h1>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-10 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <p className="font-['Montserrat'] text-lg text-black/70">Ваш кошик порожній</p>
            <Link
              href="/catalog"
              className="mt-6 inline-flex min-w-[200px] items-center justify-center rounded-xl px-8 py-3.5 font-['Montserrat'] text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: ACCENT }}
            >
              До каталогу
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10 xl:gap-14">
            <div className="min-w-0 flex-1">
              <CartLineItems showClearButton onClear={() => clearBasket()} />
            </div>

            <aside className="lg:sticky lg:top-[calc(var(--site-header-offset)+1rem)] lg:w-[min(100%,380px)] lg:shrink-0">
              <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <h2 className="font-['Montserrat'] text-lg font-semibold text-black">
                  Сума замовлення
                </h2>

                <dl className="mt-6 space-y-3 font-['Montserrat'] text-sm text-black/80">
                  <div className="flex justify-between gap-4">
                    <dt>Проміжний підсумок</dt>
                    <dd className="font-medium text-black">
                      {Math.round(subtotal).toLocaleString("uk-UA")} грн
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Вартість доставки</dt>
                    <dd className="text-right font-medium text-black/70">{deliveryLabel}</dd>
                  </div>
                  <div className="border-t border-black/10 pt-3">
                    <div className="flex justify-between gap-4 text-base font-semibold text-black">
                      <dt>Сума</dt>
                      <dd>{Math.round(total).toLocaleString("uk-UA")} грн</dd>
                    </div>
                  </div>
                </dl>

                <Link
                  href="/final"
                  className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl font-['Montserrat'] text-base font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: ACCENT }}
                >
                  Оформити замовлення
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>

                <Link
                  href="/catalog"
                  className="mt-4 block text-center font-['Montserrat'] text-sm text-black/45 hover:text-black/70"
                >
                  Продовжити покупки
                </Link>
              </div>
            </aside>
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-16 border-t border-black/10 pt-16">
            <CartRecommendations />
          </div>
        )}
      </div>
    </div>
  );
}
