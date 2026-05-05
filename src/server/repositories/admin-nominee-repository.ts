import { prisma } from '@/lib/db/prisma'

export async function listNominees() {
  return prisma.contestant.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: { select: { id: true, title: true } } },
  })
}

export async function createNominee(input: {
  name: string
  categoryId: string
  imageUrl: string
  description?: string | null
}) {
  return prisma.contestant.create({
    data: {
      name: input.name,
      categoryId: input.categoryId,
      imageUrl: input.imageUrl,
      description: input.description ?? null,
    },
  })
}

export async function updateNominee(
  id: string,
  input: {
    name?: string
    categoryId?: string
    imageUrl?: string
    description?: string | null
  }
) {
  return prisma.contestant.update({
    where: { id },
    data: input,
  })
}

export async function deleteNominee(id: string) {
  return prisma.contestant.delete({ where: { id } })
}
