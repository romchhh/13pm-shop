"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

const REMEMBER_ME_KEY = "login_remember_me";

type AuthStep =
  | "login"
  | "register"
  | "verify"
  | "forgot"
  | "reset";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectAfterLogin?: string;
  initialMode?: "login" | "register";
}

const inputClass =
  "w-full rounded-xl border border-black/12 bg-white px-4 py-3.5 font-['Montserrat'] text-sm text-black placeholder:text-black/35 focus:border-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#1C1C1C]/12";

export default function LoginModal({
  isOpen,
  onClose,
  redirectAfterLogin,
  initialMode = "login",
}: LoginModalProps) {
  const [step, setStep] = useState<AuthStep>(
    initialMode === "register" ? "register" : "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    code: "",
    newPassword: "",
  });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    setStep(initialMode === "register" ? "register" : "login");
    setError("");
    setInfo("");
    setFormData((prev) => ({ ...prev, code: "", newPassword: "" }));
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setRememberMe(localStorage.getItem(REMEMBER_ME_KEY) === "true");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;
    try {
      localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));
    } catch {
      /* ignore */
    }
  }, [isOpen, rememberMe]);

  if (!isOpen) return null;

  const goAfterAuth = () => {
    onClose();
    router.push(redirectAfterLogin || "/profile");
    router.refresh();
  };

  const signInWithPassword = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });
    if (result?.error) {
      if (result.error.includes("EMAIL_NOT_VERIFIED")) {
        setStep("verify");
        setInfo("Підтвердіть email — ми вже надсилали код, або надішліть новий");
        setError("");
        return false;
      }
      setError("Невірний email або пароль");
      return false;
    }
    goAfterAuth();
    return true;
  };

  const handleLogin = async () => {
    const pre = await fetch("/api/auth/pre-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });
    const preData = await pre.json().catch(() => ({ status: "invalid" }));
    if (preData.status === "needs_verification") {
      setStep("verify");
      setInfo("Підтвердіть email кодом з листа. Можете надіслати код ще раз.");
      setError("");
      return;
    }
    if (preData.status !== "ok") {
      setError("Невірний email або пароль");
      return;
    }
    await signInWithPassword(formData.email, formData.password);
  };

  const handleRegister = async () => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Помилка реєстрації");
      return;
    }
    setInfo(data.message || "Код надіслано на пошту");
    setStep("verify");
  };

  const handleVerify = async () => {
    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        code: formData.code,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Невірний код");
      return;
    }
    setInfo("Email підтверджено");
    await signInWithPassword(formData.email, formData.password);
  };

  const handleForgot = async () => {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Помилка запиту");
      return;
    }
    setInfo(data.message || "Якщо акаунт існує, код надіслано");
    setStep("reset");
  };

  const handleReset = async () => {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        code: formData.code,
        password: formData.newPassword,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Не вдалося змінити пароль");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      password: prev.newPassword,
      code: "",
      newPassword: "",
    }));
    setInfo("Пароль оновлено. Увійдіть");
    setStep("login");
  };

  const handleResend = async () => {
    const purpose = step === "reset" || step === "forgot" ? "password-reset" : "email-verify";
    const res = await fetch("/api/auth/resend-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.email, purpose }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Не вдалося надіслати код");
      return;
    }
    setError("");
    setInfo(data.message || "Новий код надіслано");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (step === "login") await handleLogin();
      else if (step === "register") await handleRegister();
      else if (step === "verify") await handleVerify();
      else if (step === "forgot") await handleForgot();
      else if (step === "reset") await handleReset();
    } catch {
      setError("Щось пішло не так. Спробуйте ще раз");
    } finally {
      setLoading(false);
    }
  };

  const title =
    step === "verify"
      ? "Підтвердження email"
      : step === "forgot"
        ? "Скидання пароля"
        : step === "reset"
          ? "Новий пароль"
          : "Кабінет";

  const subtitle =
    step === "verify"
      ? `Код надіслано на ${formData.email || "вашу пошту"}`
      : step === "forgot"
        ? "Вкажіть email — надішлемо код"
        : step === "reset"
          ? "Введіть код з листа та новий пароль"
          : "−3% на першу покупку · дані підтягнуться самі";

  const primaryLabel =
    step === "login"
      ? "Увійти"
      : step === "register"
        ? "Зареєструватися"
        : step === "verify"
          ? "Підтвердити"
          : step === "forgot"
            ? "Надіслати код"
            : "Зберегти пароль";

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/55 py-6 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div className="relative my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
        <div className="flex items-center justify-between bg-[#1C1C1C] px-6 py-5 text-white sm:px-8">
          <div>
            <h2
              id="login-modal-title"
              className="font-['Montserrat'] text-lg font-bold uppercase tracking-[0.14em]"
            >
              {title}
            </h2>
            <p className="mt-1 font-['Montserrat'] text-xs text-white/65">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Закрити"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-7 sm:px-8 sm:py-8">
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
            {step === "register" && (
              <input
                type="text"
                name="name"
                placeholder="Ім'я"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
                required
                autoComplete="name"
              />
            )}

            {(step === "login" ||
              step === "register" ||
              step === "forgot" ||
              step === "verify" ||
              step === "reset") && (
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
                required
                autoComplete="email"
                readOnly={step === "verify" || step === "reset"}
              />
            )}

            {(step === "login" || step === "register") && (
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Пароль"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`${inputClass} pr-12`}
                  required
                  autoComplete={step === "login" ? "current-password" : "new-password"}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                  aria-label={showPassword ? "Сховати пароль" : "Показати пароль"}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    )}
                  </svg>
                </button>
              </div>
            )}

            {(step === "verify" || step === "reset") && (
              <input
                type="text"
                name="code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="Код з листа (6 цифр)"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.replace(/\D/g, "").slice(0, 6),
                  })
                }
                className={inputClass}
                required
                autoComplete="one-time-code"
              />
            )}

            {step === "reset" && (
              <input
                type="password"
                name="newPassword"
                placeholder="Новий пароль"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className={inputClass}
                required
                minLength={6}
                autoComplete="new-password"
              />
            )}

            {step === "login" && (
              <div className="flex items-center justify-between gap-3">
                <label className="flex cursor-pointer select-none items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#1C1C1C] focus:ring-[#1C1C1C]"
                  />
                  <span className="font-['Montserrat'] text-sm text-black/70">
                    Запам&apos;ятати мене
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setInfo("");
                    setStep("forgot");
                  }}
                  className="font-['Montserrat'] text-sm text-black/55 underline underline-offset-2 hover:text-black"
                >
                  Забули пароль?
                </button>
              </div>
            )}

            {info && (
              <p className="font-['Montserrat'] text-sm text-[var(--site-accent,#4A5840)]">{info}</p>
            )}
            {error && (
              <p className="font-['Montserrat'] text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-[3.25rem] w-full items-center justify-center rounded-2xl bg-[#1C1C1C] px-6 py-3.5 font-['Montserrat'] text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-black disabled:opacity-50"
            >
              {loading ? "Завантаження..." : primaryLabel}
            </button>

            {(step === "verify" || step === "reset") && (
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setLoading(true);
                  setError("");
                  void handleResend().finally(() => setLoading(false));
                }}
                className="w-full font-['Montserrat'] text-sm text-black/55 underline underline-offset-2 hover:text-black"
              >
                Надіслати код ще раз
              </button>
            )}

            {step === "login" && (
              <button
                type="button"
                onClick={() => {
                  setStep("register");
                  setError("");
                  setInfo("");
                }}
                className="flex min-h-[3rem] w-full items-center justify-center rounded-2xl border border-[#1C1C1C] px-6 py-3 font-['Montserrat'] text-sm font-bold uppercase tracking-[0.12em] text-[#1C1C1C] transition-colors hover:bg-[#1C1C1C] hover:text-white"
              >
                Створити акаунт
              </button>
            )}

            {step === "register" && (
              <button
                type="button"
                onClick={() => {
                  setStep("login");
                  setError("");
                  setInfo("");
                }}
                className="flex min-h-[3rem] w-full items-center justify-center rounded-2xl border border-[#1C1C1C] px-6 py-3 font-['Montserrat'] text-sm font-bold uppercase tracking-[0.12em] text-[#1C1C1C] transition-colors hover:bg-[#1C1C1C] hover:text-white"
              >
                Вже є акаунт? Увійти
              </button>
            )}

            {(step === "forgot" || step === "reset" || step === "verify") && (
              <button
                type="button"
                onClick={() => {
                  setStep("login");
                  setError("");
                  setInfo("");
                  setFormData((prev) => ({ ...prev, code: "", newPassword: "" }));
                }}
                className="w-full font-['Montserrat'] text-sm text-black/55 hover:text-black"
              >
                ← Назад до входу
              </button>
            )}
          </form>

          {(step === "login" || step === "register") && (
            <>
              <div className="relative my-7">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-3 font-['Montserrat'] text-black/45">
                    Або продовжити через
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  signIn("google", { callbackUrl: redirectAfterLogin || "/profile" })
                }
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-black/12 px-4 py-3.5 transition-colors hover:bg-[#F2F2F0]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="font-['Montserrat'] text-sm font-medium">Google</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
