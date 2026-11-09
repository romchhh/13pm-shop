import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
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
    const password = String(body.password || "");

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email і код обов'язкові" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Пароль має містити щонайменше 6 символів" },
        { status: 400 }
      );
    }

    const consumed = await consumeAuthCode("password-reset", email, code);
    if (!consumed.ok) {
      return NextResponse.json({ error: consumed.error }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      email,
      message: "Пароль оновлено. Увійдіть з новим паролем",
    });
  } catch (error) {
    console.error("reset-password error:", error);
    return NextResponse.json({ error: "Помилка скидання пароля" }, { status: 500 });
  }
}
