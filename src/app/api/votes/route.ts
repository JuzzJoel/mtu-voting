import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import { voteBatchSchema } from "@/lib/security/validators";
import { enforceCsrf } from "@/lib/security/csrf";

export async function POST(req: NextRequest) {
  try {
    await enforceCsrf(req);
    const user = await requireUser(req);
    const body = voteBatchSchema.parse(await req.json());
    const { votes } = body;

    const uniqueCategories = new Set(votes.map((vote) => vote.categoryId));
    if (uniqueCategories.size !== votes.length) {
      return NextResponse.json({ error: "Duplicate category votes detected." }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      for (const vote of votes) {
        const contestant = await tx.contestant.findFirst({
          where: {
            id: vote.contestantId,
            categoryId: vote.categoryId
          },
          select: { id: true }
        });
        if (!contestant) throw new Error("INVALID_CONTESTANT");

        await tx.vote.create({
          data: {
            userId: user.id,
            categoryId: vote.categoryId,
            contestantId: vote.contestantId
          }
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "You already voted in this category." }, { status: 409 });
    }
    if (error instanceof Error && error.message === "INVALID_CONTESTANT") {
      return NextResponse.json({ error: "Contestant/category mismatch." }, { status: 400 });
    }
    return NextResponse.json({ error: "Vote failed." }, { status: 500 });
  }
}
