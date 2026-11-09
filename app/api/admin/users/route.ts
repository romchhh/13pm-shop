import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { not: null } },
          { phone: { not: null } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        password: true,
        bonusPoints: true,
        createdAt: true,
        accounts: {
          select: { provider: true },
        },
        _count: {
          select: { orders: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const payload = users.map(({ password, accounts, ...user }) => {
      const providers = accounts.map((a) => a.provider);
      const isRegistered =
        Boolean(password) || providers.length > 0;
      return {
        ...user,
        isRegistered,
        authProviders: providers,
        hasPassword: Boolean(password),
      };
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
