import { prisma } from '@/lib/db/prisma'

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, title: true, order: true, isActive: true },
  })
}

export async function createCategory(input: {
  title: string
  order: number
  isActive: boolean
}) {
  return prisma.category.create({
    data: {
      title: input.title,
      order: input.order,
      isActive: input.isActive,
    },
  })
}

export async function updateCategory(
  id: string,
  input: { title?: string; order?: number; isActive?: boolean }
) {
  return prisma.category.update({
    where: { id },
    data: input,
  })
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } })
}
