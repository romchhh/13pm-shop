import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/sessionUser";
import {
  getBonusPercentForPurchase,
  getLoyaltyTierForDisplay,
} from "@/lib/loyalty";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paidOrders = await prisma.order.findMany({
      where: { userId: user.id, paymentStatus: "paid" },
      select: {
        id: true,
        items: { select: { price: true, quantity: true } },
      },
    });

    const totalSpent = paidOrders.reduce((sum, order) => {
      const itemsTotal = order.items.reduce(
        (s, it) => s + Number(it.price) * it.quantity,
        0
      );
      return sum + itemsTotal;
    }, 0);

    const paidOrdersCount = paidOrders.length;
    const bonusPercent = getBonusPercentForPurchase(totalSpent, paidOrdersCount);
    const tier = getLoyaltyTierForDisplay(totalSpent, paidOrdersCount);

    return NextResponse.json({
      totalSpent,
      bonusPercent,
      tierName: tier.name,
      nextTier: tier.nextTier,
      progress: tier.progress,
      bonusPoints: user.bonusPoints,
    });
  } catch (error) {
    console.error("Error fetching loyalty:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
