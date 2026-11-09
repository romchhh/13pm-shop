import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  clothingSize: true,
  birthDate: true,
  bonusPoints: true,
  image: true,
} as const;

export type SessionUserProfile = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  clothingSize: string | null;
  birthDate: Date | null;
  bonusPoints: number;
  image: string | null;
};

/** Поточний користувач з NextAuth-сесії або null. */
export async function getSessionUser(): Promise<SessionUserProfile | null> {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;
  const email = session.user.email ?? undefined;

  if (userId) {
    const byId = await prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });
    if (byId) return byId;
  }

  if (email) {
    return prisma.user.findUnique({
      where: { email },
      select: userSelect,
    });
  }

  return null;
}
