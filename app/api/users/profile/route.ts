import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/sessionUser";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const existing = await getSessionUser();
    if (!existing) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, address, clothingSize, birthDate } = body;

    const birthDateToSet =
      existing.birthDate != null
        ? undefined
        : birthDate
          ? new Date(birthDate)
          : null;

    const user = await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: name || null,
        email: email || existing.email,
        phone: phone || null,
        address: address || null,
        clothingSize: clothingSize || null,
        ...(birthDateToSet !== undefined && { birthDate: birthDateToSet }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        clothingSize: true,
        birthDate: true,
        bonusPoints: true,
        image: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
