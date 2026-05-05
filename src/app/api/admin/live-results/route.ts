import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/guards";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const grouped = await prisma.vote.groupBy({
      by: ["categoryId", "contestantId"],
      _count: { _all: true }
    });

    const contestantIds = [...new Set(grouped.map((g) => g.contestantId))];
    const categoryIds = [...new Set(grouped.map((g) => g.categoryId))];
    const contestants = await prisma.contestant.findMany({
      where: { id: { in: contestantIds } },
      select: { id: true, name: true }
    });
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, title: true }
    });

    const contestantMap = Object.fromEntries(contestants.map((c) => [c.id, c]));
    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

    const totals = grouped.map((row) => ({
      categoryId: row.categoryId,
      categoryTitle: categoryMap[row.categoryId]?.title ?? "Unknown",
      contestantId: row.contestantId,
      contestantName: contestantMap[row.contestantId]?.name ?? "Unknown",
      votes: row._count._all
    }));

    const byLevelDepartment = await prisma.$queryRaw<
      Array<{ category: string; contestant: string; level: string | null; department: string | null; votes: bigint }>
    >`SELECT c.title AS category, ct.name AS contestant, u.level AS level, u.department AS department, COUNT(v.id) AS votes
      FROM "Vote" v
      JOIN "Contestant" ct ON v."contestantId" = ct.id
      JOIN "Category" c ON v."categoryId" = c.id
      JOIN "User" u ON v."userId" = u.id
      GROUP BY c.title, ct.name, u.level, u.department
      ORDER BY c.title, votes DESC`;

    return NextResponse.json({
      totals,
      byLevelDepartment: byLevelDepartment.map((row) => ({ ...row, votes: Number(row.votes) }))
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
