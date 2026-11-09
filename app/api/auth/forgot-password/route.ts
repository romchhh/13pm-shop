import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  issueAuthCode,
  normalizeAuthEmail,
  sendPasswordResetCodeEmail,
} from "@/lib/authEmailCodes";

export const dynamic = "force-dynamic";

/**
 * Завжди повертає success (анти-enumeration), але код шлемо лише
 * якщо є акаунт з паролем.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = normalizeAuthEmail(String(body.email || ""));

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Вкажіть коректний email" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });

    if (user?.password) {
      const { code } = await issueAuthCode("password-reset", email);
      const sent = await sendPasswordResetCodeEmail(email, code);
      if (!sent.success) {
        return NextResponse.json(
          {
            error:
              sent.error ||
              "Не вдалося надіслати лист. Спробуйте пізніше.",
          },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      email,
      message:
        "Якщо акаунт існує, ми надіслали код для скидання пароля на пошту",
    });
  } catch (error) {
    console.error("forgot-password error:", error);
    return NextResponse.json({ error: "Помилка запиту" }, { status: 500 });
  }
}
