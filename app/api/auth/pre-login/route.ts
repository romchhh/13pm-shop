import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { normalizeAuthEmail } from "@/lib/authEmailCodes";

export const dynamic = "force-dynamic";

/** Перевірка логіну без створення сесії (для UX модалки). */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = normalizeAuthEmail(String(body.email || ""));
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ status: "invalid" as const });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { password: true, emailVerified: true },
    });

    if (!user?.password) {
      return NextResponse.json({ status: "invalid" as const });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ status: "invalid" as const });
    }

    if (!user.emailVerified) {
      return NextResponse.json({ status: "needs_verification" as const, email });
    }

    return NextResponse.json({ status: "ok" as const });
  } catch (error) {
    console.error("pre-login error:", error);
    return NextResponse.json({ status: "invalid" as const });
  }
}
