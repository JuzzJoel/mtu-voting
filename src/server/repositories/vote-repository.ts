import { prisma } from '@/lib/db/prisma'

export async function getVotedCategoryIds(userId: string) {
  const voted = await prisma.vote.findMany({
    where: { userId },
    select: { categoryId: true },
  })
  return voted.map((row) => row.categoryId)
}

export async function createVotesInTransaction(
  userId: string,
  votes: { categoryId: string; nomineeId: string }[]
) {
  return prisma.$transaction(async (tx) => {
    for (const vote of votes) {
      const nominee = await tx.contestant.findFirst({
        where: { id: vote.nomineeId, categoryId: vote.categoryId },
        select: { id: true },
      })
      if (!nominee) throw new Error('INVALID_NOMINEE')

      await tx.vote.create({
        data: {
          userId,
          categoryId: vote.categoryId,
          contestantId: vote.nomineeId,
        },
      })
    }
  })
}
