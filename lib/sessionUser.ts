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

function mostFrequentSize(sizes: string[]): string | null {
  const counts = new Map<string, number>();
  for (const raw of sizes) {
    const size = raw?.trim();
    if (!size || size.toLowerCase() === "one" || size === "-") continue;
    counts.set(size, (counts.get(size) || 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [size, count] of counts) {
    if (count > bestCount) {
      best = size;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Якщо в профілі порожні контакти / адреса / розмір —
 * підтягуємо з останнього замовлення і зберігаємо в User.
 */
export async function backfillProfileFromOrders(
  user: SessionUserProfile
): Promise<SessionUserProfile> {
  const needsName = !user.name?.trim();
  const needsPhone = !user.phone?.trim();
  const needsAddress = !user.address?.trim();
  const needsSize = !user.clothingSize?.trim();
  if (!needsName && !needsPhone && !needsAddress && !needsSize) {
    return user;
  }

  const email = user.email?.trim().toLowerCase() || null;
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { userId: user.id },
        ...(email ? [{ email: { equals: email, mode: "insensitive" as const } }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      customerName: true,
      phoneNumber: true,
      city: true,
      postOffice: true,
      items: { select: { size: true } },
    },
  });

  if (!order) return user;

  const data: {
    name?: string;
    phone?: string;
    address?: string;
    clothingSize?: string;
  } = {};

  if (needsName && order.customerName?.trim()) {
    data.name = order.customerName.trim();
  }
  if (needsPhone && order.phoneNumber?.trim()) {
    data.phone = order.phoneNumber.trim();
  }
  if (needsAddress) {
    const address = [order.city, order.postOffice]
      .map((s) => (s || "").trim())
      .filter(Boolean)
      .join(", ");
    if (address) data.address = address;
  }
  if (needsSize) {
    const size = mostFrequentSize(order.items.map((i) => i.size));
    if (size) data.clothingSize = size;
  }

  if (!Object.keys(data).length) return user;

  return prisma.user.update({
    where: { id: user.id },
    data,
    select: userSelect,
  });
}

/** Поточний користувач з NextAuth-сесії або null. */
export async function getSessionUser(): Promise<SessionUserProfile | null> {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;
  const email = session.user.email ?? undefined;

  let user: SessionUserProfile | null = null;

  if (userId) {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });
  }

  if (!user && email) {
    user = await prisma.user.findUnique({
      where: { email },
      select: userSelect,
    });
  }

  if (!user) return null;

  try {
    return await backfillProfileFromOrders(user);
  } catch {
    return user;
  }
}
