import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  consumeAuthCode,
  normalizeAuthEmail,
} from "@/lib/authEmailCodes";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = normalizeAuthEmail(String(body.email || ""));
    const code = String(body.code || "");

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email і код обов'язкові" },
        { status: 400 }
      );
    }

    const consumed = await consumeAuthCode("email-verify", email, code);
    if (!consumed.ok) {
      return NextResponse.json({ error: consumed.error }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });

    if (!user?.password) {
      return NextResponse.json(
        { error: "Користувача не знайдено. Пройдіть реєстрацію знову" },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    return NextResponse.json({
      verified: true,
      email,
      message: "Email підтверджено. Тепер можете увійти",
    });
  } catch (error) {
    console.error("verify-email error:", error);
    return NextResponse.json({ error: "Помилка підтвердження" }, { status: 500 });
  }
}
