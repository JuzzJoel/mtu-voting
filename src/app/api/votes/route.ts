import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import { voteSchema } from "@/lib/security/validators";
import { enforceCsrf } from "@/lib/security/csrf";

export async function POST(req: NextRequest) {
  try {
    await enforceCsrf(req);
    const user = await requireUser(req);
    const body = voteSchema.parse(await req.json());

    await prisma.$transaction(async (tx) => {
      const contestant = await tx.contestant.findFirst({
        where: {
          id: body.contestantId,
          categoryId: body.categoryId
        },
        select: { id: true }
      });
      if (!contestant) throw new Error("INVALID_CONTESTANT");

      await tx.vote.create({
        data: {
          userId: user.id,
          categoryId: body.categoryId,
          contestantId: body.contestantId
        }
      });
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
