"use client";

import Link from "next/link";
import { useState } from "react";
import { siteContact } from "@/lib/siteContact";

export default function CooperationContactBlock() {
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!agreed || !form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Помилка відправки");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Помилка відправки. Спробуйте пізніше.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact-form" className="scroll-mt-24 pt-10 border-t border-black/10">
      <h2 className="text-2xl md:text-3xl font-semibold mb-8">Зв&apos;язатися з нами</h2>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
        <div className="w-full lg:w-[55%] rounded-2xl p-8 lg:p-12 bg-white border border-[#1C1C1C]/10">
          <h3
            className="text-[#1C1C1C] uppercase mb-8"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 600,
              fontSize: "clamp(18px, 2vw, 26px)",
              letterSpacing: "0.04em",
            }}
          >
            Написати 13pm tactic
          </h3>

          {submitted ? (
            <div className="py-12 text-center">
              <p
                className="text-[#1C1C1C]"
                style={{ fontFamily: "Montserrat, sans-serif", fontSize: "18px", fontWeight: 500 }}
              >
                Дякуємо! Ми отримали ваше повідомлення і зв&apos;яжемося найближчим часом.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label
                  className="block text-[#1C1C1C]/60 mb-1"
                  style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", letterSpacing: "0.08em" }}
                >
                  ІМ&apos;Я *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border-b border-[#1C1C1C]/30 pb-2 text-[#1C1C1C] outline-none focus:border-[#1C1C1C] transition-colors"
                  style={{ fontFamily: "Montserrat, sans-serif", fontSize: "15px" }}
                />
              </div>

              <div>
                <label
                  className="block text-[#1C1C1C]/60 mb-1"
                  style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", letterSpacing: "0.08em" }}
                >
                  EMAIL *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-transparent border-b border-[#1C1C1C]/30 pb-2 text-[#1C1C1C] outline-none focus:border-[#1C1C1C] transition-colors"
                  style={{ fontFamily: "Montserrat, sans-serif", fontSize: "15px" }}
                />
              </div>

              <div>
                <label
                  className="block text-[#1C1C1C]/60 mb-1"
                  style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", letterSpacing: "0.08em" }}
                >
                  ВАШ ЗАПИТ *
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={3}
                  className="w-full bg-transparent border-b border-[#1C1C1C]/30 pb-2 text-[#1C1C1C] outline-none focus:border-[#1C1C1C] transition-colors resize-none"
                  style={{ fontFamily: "Montserrat, sans-serif", fontSize: "15px" }}
                />
                <p
                  className="text-[#1C1C1C]/40 mt-1"
                  style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px" }}
                >
                  Опт, пошиття, дропшипінг або інше питання
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group mt-2">
                <span
                  className={`mt-0.5 w-5 h-5 flex-shrink-0 border rounded-sm transition-colors flex items-center justify-center ${
                    agreed
                      ? "bg-[#1C1C1C] border-[#1C1C1C]"
                      : "border-[#1C1C1C]/40 group-hover:border-[#1C1C1C]"
                  }`}
                  onClick={() => setAgreed(!agreed)}
                >
                  {agreed && (
                    <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
                      <path
                        d="M1 5l3 3 7-7"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span
                  className="text-[#1C1C1C]/70 leading-relaxed"
                  style={{ fontFamily: "Montserrat, sans-serif", fontSize: "13px" }}
                  onClick={() => setAgreed(!agreed)}
                >
                  Продовжуючи, я приймаю умови{" "}
                  <Link href="/terms-of-service" className="underline hover:text-[#1C1C1C] transition-colors">
                    Публічної оферти
                  </Link>{" "}
                  та надаю згоду на обробку своїх персональних даних відповідно до{" "}
                  <Link href="/privacy-policy" className="underline hover:text-[#1C1C1C] transition-colors">
                    Політики конфіденційності
                  </Link>
                </span>
              </label>

              {error && <p className="text-red-600 text-sm font-['Montserrat']">{error}</p>}

              <div className="pt-2 w-full">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    !agreed || !form.name.trim() || !form.email.trim() || !form.message.trim() || sending
                  }
                  className="w-full px-10 py-4 bg-[#1C1C1C] text-white uppercase transition-all hover:bg-[#1C1C1C]/85 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 600,
                    fontSize: "13px",
                    letterSpacing: "0.12em",
                  }}
                >
                  {sending ? "Відправка…" : "Відправити"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-[45%] rounded-2xl p-8 lg:p-12 grid grid-cols-2 gap-x-8 gap-y-12 content-start bg-white border border-[#1C1C1C]/10">
          <div className="col-span-2 sm:col-span-1">
            <p
              className="text-[#1C1C1C]/50 uppercase mb-3"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 500,
                fontSize: "clamp(13px, 1.2vw, 16px)",
                letterSpacing: "0.06em",
              }}
            >
              Телефон
            </p>
            {siteContact.phones.map((phone) => (
              <a
                key={phone.tel}
                href={`tel:${phone.tel}`}
                className="block text-[#1C1C1C] hover:opacity-70 transition-opacity"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 400,
                  fontSize: "clamp(13px, 1.1vw, 15px)",
                  lineHeight: "159%",
                }}
              >
                {phone.display}
              </a>
            ))}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <p
              className="text-[#1C1C1C]/50 uppercase mb-3"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 500,
                fontSize: "clamp(13px, 1.2vw, 16px)",
                letterSpacing: "0.06em",
              }}
            >
              Месенджери
            </p>
            <p
              className="text-[#1C1C1C] mb-2"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 400,
                fontSize: "clamp(13px, 1.1vw, 15px)",
                lineHeight: "159%",
              }}
            >
              <a href={`tel:${siteContact.messengerPhone.tel}`} className="hover:opacity-70">
                {siteContact.messengerPhone.display}
              </a>
              <span className="text-[#1C1C1C]/70"> ({siteContact.messengerLabel})</span>
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={siteContact.viberUrl}
                className="text-[#1C1C1C] underline hover:opacity-70 text-sm font-['Montserrat']"
              >
                Viber
              </a>
              <a
                href={siteContact.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1C1C1C] underline hover:opacity-70 text-sm font-['Montserrat']"
              >
                Telegram
              </a>
            </div>
          </div>

          <div>
            <p
              className="text-[#1C1C1C]/50 uppercase mb-3"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 500,
                fontSize: "clamp(13px, 1.2vw, 16px)",
                letterSpacing: "0.06em",
              }}
            >
              Графік роботи
            </p>
            <div
              className="text-[#1C1C1C] space-y-1"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 400,
                fontSize: "clamp(13px, 1.1vw, 15px)",
                lineHeight: "159%",
              }}
            >
              {siteContact.scheduleLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
