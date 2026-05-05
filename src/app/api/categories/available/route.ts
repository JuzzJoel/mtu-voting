import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const voted = await prisma.vote.findMany({
      where: { userId: user.id },
      select: { categoryId: true }
    });

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        id: { notIn: voted.map((row) => row.categoryId) }
      },
      include: {
        contestants: {
          select: { id: true, name: true, imageUrl: true }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
