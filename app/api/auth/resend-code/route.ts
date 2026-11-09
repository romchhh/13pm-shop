import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  issueAuthCode,
  normalizeAuthEmail,
  sendPasswordResetCodeEmail,
  sendVerificationCodeEmail,
  type AuthCodePurpose,
} from "@/lib/authEmailCodes";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = normalizeAuthEmail(String(body.email || ""));
    const purpose = String(body.purpose || "email-verify") as AuthCodePurpose;

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Вкажіть коректний email" }, { status: 400 });
    }
    if (purpose !== "email-verify" && purpose !== "password-reset") {
      return NextResponse.json({ error: "Невідомий тип коду" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { password: true, emailVerified: true },
    });

    if (purpose === "email-verify") {
      if (!user?.password) {
        return NextResponse.json(
          { error: "Спочатку завершіть реєстрацію" },
          { status: 400 }
        );
      }
      if (user.emailVerified) {
        return NextResponse.json(
          { error: "Email уже підтверджено. Увійдіть" },
          { status: 400 }
        );
      }
      const { code } = await issueAuthCode("email-verify", email);
      const sent = await sendVerificationCodeEmail(email, code);
      if (!sent.success) {
        return NextResponse.json(
          { error: sent.error || "Не вдалося надіслати лист" },
          { status: 502 }
        );
      }
    } else {
      if (!user?.password) {
        // Не розкриваємо наявність акаунта
        return NextResponse.json({
          ok: true,
          message: "Якщо акаунт існує, код надіслано",
        });
      }
      const { code } = await issueAuthCode("password-reset", email);
      const sent = await sendPasswordResetCodeEmail(email, code);
      if (!sent.success) {
        return NextResponse.json(
          { error: sent.error || "Не вдалося надіслати лист" },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Новий код надіслано на пошту",
    });
  } catch (error) {
    console.error("resend-code error:", error);
    return NextResponse.json({ error: "Помилка надсилання" }, { status: 500 });
  }
}
