"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDiscountedPrice } from "@/lib/pricing";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

const DEFAULT_SIZE = "—";

const INPUT_CLASS =
  "w-full rounded-xl border border-black/12 bg-white px-4 py-3.5 font-['Montserrat'] text-sm text-black placeholder:text-black/35 transition-colors focus:border-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#1C1C1C]/12";

const SUBMIT_CLASS =
  "mt-1 flex min-h-[3.25rem] w-full items-center justify-center rounded-2xl bg-[#1C1C1C] px-6 py-3.5 font-['Montserrat'] text-base font-bold tracking-wide text-white shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-[transform,box-shadow,background-color] hover:bg-black hover:shadow-[0_6px_24px_rgba(0,0,0,0.24)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:hover:bg-[#1C1C1C]";

type ProductForOneClick = {
  id: number;
  name: string;
  price: number;
  discount_percentage?: number | null;
  in_stock?: boolean;
  stock?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  product: ProductForOneClick;
  quantity: number;
};

function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export default function OneClickOrderModal({
  open,
  onClose,
  product,
  quantity,
}: Props) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    setError(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setCustomerName("");
      setPhone("");
      setEmail("");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const unitPrice = getDiscountedPrice(product.price, product.discount_percentage);
  const lineTotal = Math.round(unitPrice * quantity * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nameTrim = customerName.trim();
    const phoneTrim = phone.trim();
    if (!nameTrim) {
      setError("Вкажіть ПІБ.");
      return;
    }
    const digits = normalizePhoneDigits(phoneTrim);
    if (digits.length < 9) {
      setError("Вкажіть коректний номер телефону.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          one_click: true,
          customer_name: nameTrim,
          phone_number: phoneTrim,
          email: email.trim() || null,
          payment_type: "prepay",
          delivery_cost: 0,
          items: [
            {
              product_id: product.id,
              product_name: product.name,
              size: DEFAULT_SIZE,
              quantity,
              price: Math.round(unitPrice * 100) / 100,
            },
          ],
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          typeof data.error === "string"
            ? data.error
            : "Не вдалося оформити замовлення. Спробуйте пізніше.";
        const details = data.details;
        if (Array.isArray(details)) {
          setError(`${msg}\n${details.join("\n")}`);
        } else {
          setError(msg);
        }
        setSubmitting(false);
        return;
      }

      const orderId = data.orderId as string | undefined;
      if (!orderId) {
        setError("Сервер не повернув номер замовлення.");
        setSubmitting(false);
        return;
      }

      onClose();
      router.push(`/success?orderReference=${encodeURIComponent(orderId)}`);
    } catch {
      setError("Помилка мережі. Перевірте з'єднання і спробуйте ще раз.");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[var(--z-site-overlay)] flex items-center justify-center bg-black/65 p-4 sm:p-6"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="one-click-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-black/[0.06] bg-white font-['Montserrat'] shadow-[0_24px_64px_rgba(0,0,0,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-black/[0.06] bg-[#faf9f7] px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2
                id="one-click-title"
                className="font-['Montserrat'] text-xl font-bold tracking-tight text-[#1C1C1C] sm:text-2xl"
              >
                Купити в 1 клік
              </h2>
              <p className="mt-1 line-clamp-2 text-sm text-black/55">{product.name}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-xl leading-none text-black/70 transition-colors hover:bg-black/10 hover:text-black"
              aria-label="Закрити"
            >
              ×
            </button>
          </div>
          <p className="mt-3 text-sm font-semibold text-black">
            {lineTotal.toLocaleString("uk-UA")} ₴
            {quantity > 1 ? (
              <span className="font-normal text-black/50">
                {" "}
                · {quantity} шт.
              </span>
            ) : null}
          </p>
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <p className="mb-5 rounded-xl border border-black/[0.06] bg-[#F2F2F0] px-4 py-3 text-sm leading-relaxed text-black/70">
            Залиште контакти — менеджер уточнить доставку та відділення. Оплата накладеним
            платежем при отриманні.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="one-click-name"
                className="mb-1.5 block text-sm font-semibold text-black"
              >
                ПІБ <span className="text-red-500">*</span>
              </label>
              <input
                id="one-click-name"
                type="text"
                autoComplete="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={INPUT_CLASS}
                placeholder="Іванов Іван Іванович"
                disabled={submitting}
              />
            </div>
            <div>
              <label
                htmlFor="one-click-phone"
                className="mb-1.5 block text-sm font-semibold text-black"
              >
                Телефон <span className="text-red-500">*</span>
              </label>
              <input
                id="one-click-phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={INPUT_CLASS}
                placeholder="+380 50 123 4567"
                disabled={submitting}
              />
            </div>
            <div>
              <label
                htmlFor="one-click-email"
                className="mb-1.5 block text-sm font-semibold text-black"
              >
                Email <span className="font-normal text-black/45">(необов&apos;язково)</span>
              </label>
              <input
                id="one-click-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT_CLASS}
                placeholder="email@example.com"
                disabled={submitting}
              />
            </div>

            {error && (
              <p
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 whitespace-pre-line"
                role="alert"
              >
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className={SUBMIT_CLASS}>
              {submitting ? "Надсилаємо…" : "Купити в 1 клік"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
