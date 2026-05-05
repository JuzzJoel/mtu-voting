import { getActiveCategories } from '@/server/repositories/category-repository'
import { getVotedCategoryIds } from '@/server/repositories/vote-repository'

export type CategoryResponse = {
  id: string
  name: string
  order: number
  nominees: { id: string; name: string; imageUrl: string }[]
}

export async function listCategoriesForUser(userId: string) {
  const votedCategoryIds = await getVotedCategoryIds(userId)
  const categories = await getActiveCategories(votedCategoryIds)

  return categories.map((category, index) => ({
    id: category.id,
    name: category.title,
    order: index + 1,
    nominees: category.contestants.map((contestant) => ({
      id: contestant.id,
      name: contestant.name,
      imageUrl: contestant.imageUrl,
    })),
  })) as CategoryResponse[]
}
