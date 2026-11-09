import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/sessionUser";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await params;
    const id = Number(productId);
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    await prisma.wishlist.deleteMany({
      where: { userId: user.id, productId: id },
    });

    return NextResponse.json({ removed: true });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
