import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  issueAuthCode,
  normalizeAuthEmail,
  sendVerificationCodeEmail,
} from "@/lib/authEmailCodes";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = normalizeAuthEmail(String(body.email || ""));
    const password = String(body.password || "");
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Вкажіть коректний email" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Пароль має містити щонайменше 6 символів" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        emailVerified: true,
        accounts: { select: { provider: true }, take: 1 },
      },
    });

    // Повноцінний акаунт уже є
    if (existingUser?.password && existingUser.emailVerified) {
      return NextResponse.json(
        { error: "Користувач з таким email вже існує. Увійдіть або скиньте пароль." },
        { status: 400 }
      );
    }

    // Є пароль, але email ще не підтверджено — оновлюємо пароль і шлемо код знову
    if (existingUser?.password && !existingUser.emailVerified) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          ...(name ? { name } : {}),
        },
      });
    } else if (existingUser && !existingUser.password) {
      // Гість з замовлення — «забираємо» акаунт
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          emailVerified: null,
          ...(name ? { name } : {}),
        },
      });
    } else if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
          emailVerified: null,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Користувач з таким email вже існує" },
        { status: 400 }
      );
    }

    const { code } = await issueAuthCode("email-verify", email);
    const sent = await sendVerificationCodeEmail(email, code);
    if (!sent.success) {
      return NextResponse.json(
        {
          error:
            sent.error ||
            "Не вдалося надіслати код на пошту. Перевірте RESEND_API_KEY / EMAIL_FROM.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      needsVerification: true,
      email,
      message: "Ми надіслали код підтвердження на вашу пошту",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Помилка реєстрації" }, { status: 500 });
  }
}
