import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/newsletter/recipients
 * Список email для розсилки: користувачі + підписники з футера.
 */
export async function GET() {
  try {
    const [users, subscribers] = await Promise.all([
      prisma.user.findMany({
        where: { email: { not: null } },
        select: { id: true, email: true, name: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.newsletterSubscriber.findMany({
        select: { id: true, email: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const byEmail = new Map<
      string,
      { id: string; email: string; name: string | null; source: string }
    >();

    for (const u of users) {
      const email = u.email?.trim();
      if (!email) continue;
      const key = email.toLowerCase();
      byEmail.set(key, {
        id: `user-${u.id}`,
        email,
        name: u.name,
        source: "account",
      });
    }

    for (const s of subscribers) {
      const key = s.email.toLowerCase();
      if (byEmail.has(key)) continue;
      byEmail.set(key, {
        id: `subscriber-${s.id}`,
        email: s.email,
        name: null,
        source: "newsletter",
      });
    }

    const recipients = Array.from(byEmail.values());

    return NextResponse.json({
      recipients,
      total: recipients.length,
    });
  } catch (error) {
    console.error("[newsletter/recipients]", error);
    return NextResponse.json(
      { error: "Не вдалося завантажити список" },
      { status: 500 }
    );
  }
}
