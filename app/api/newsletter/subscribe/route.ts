import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNewsletterSubscribeNotification } from "@/lib/telegram";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const source =
      typeof body.source === "string" && body.source.trim()
        ? body.source.trim().slice(0, 64)
        : "footer";

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Вкажіть коректний email" }, { status: 400 });
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email, source },
      update: { source },
    });

    sendNewsletterSubscribeNotification(email).catch((err) => {
      console.error("[newsletter/subscribe] Telegram notify failed:", err);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/newsletter/subscribe]", error);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}
