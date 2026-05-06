import { getActiveCategories } from '@/server/repositories/category-repository'
import { getVotedCategoryIds } from '@/server/repositories/vote-repository'
import { syncSanityContent } from '@/server/services/sanity-sync'

export type CategoryResponse = {
  id: string
  name: string
  order: number
  nominees: {
    id: string
    name: string
    imageUrl: string
    description: string | null
  }[]
}

export async function listCategoriesForUser(userId: string) {
  await syncSanityContent()
  const votedCategoryIds = await getVotedCategoryIds(userId)
  const categories = await getActiveCategories(votedCategoryIds)

  return categories.map((category) => ({
    id: category.id,
    name: category.title,
    order: category.order,
    nominees: category.contestants.map((contestant) => ({
      id: contestant.id,
      name: contestant.name,
      imageUrl: contestant.imageUrl,
      description: contestant.description,
    })),
  })) as CategoryResponse[]
}
