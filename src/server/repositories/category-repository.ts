import { prisma } from '@/lib/db/prisma'

export type CategoryRecord = {
  id: string
  title: string
  order: number
  contestants: { id: string; name: string; imageUrl: string }[]
}

export async function getActiveCategories(excludedCategoryIds: string[]) {
  return prisma.category.findMany({
    where: {
      isActive: true,
      id: excludedCategoryIds.length
        ? { notIn: excludedCategoryIds }
        : undefined,
    },
    include: {
      contestants: {
        select: { id: true, name: true, imageUrl: true },
      },
    },
    orderBy: { order: 'asc' },
  }) as Promise<CategoryRecord[]>
}
