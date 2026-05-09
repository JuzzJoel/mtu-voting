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
  // Validate all nominees in a single query — avoids interactive transaction
  // which is incompatible with Neon's connection pooler
  const validNominees = await prisma.contestant.findMany({
    where: {
      OR: votes.map((v) => ({ id: v.nomineeId, categoryId: v.categoryId })),
    },
    select: { id: true },
  })

  if (validNominees.length !== votes.length) {
    throw new Error('INVALID_NOMINEE')
  }

  // createMany issues a single INSERT — atomic at the DB level
  await prisma.vote.createMany({
    data: votes.map((v) => ({
      userId,
      categoryId: v.categoryId,
      contestantId: v.nomineeId,
    })),
  })
}
