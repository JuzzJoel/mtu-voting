import { createVotesInTransaction } from '@/server/repositories/vote-repository'

export type VoteInput = { categoryId: string; nomineeId: string }

export async function submitVotes(userId: string, votes: VoteInput[]) {
  const uniqueCategories = new Set(votes.map((vote) => vote.categoryId))
  if (uniqueCategories.size !== votes.length) {
    throw new Error('DUPLICATE_CATEGORY')
  }

  await createVotesInTransaction(userId, votes)
}
