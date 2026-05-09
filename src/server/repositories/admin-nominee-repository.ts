import { prisma } from '@/lib/db/prisma'

export async function listNominees() {
  return prisma.contestant.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: { select: { id: true, title: true } } },
  })
}

const DEFAULT_IMAGE = '/images/no-face.jpg'

export async function createNominee(input: {
  name: string
  categoryId: string
  imageUrl?: string | null
  description?: string | null
  position?: number | null
}) {
  return prisma.contestant.create({
    data: {
      name: input.name,
      categoryId: input.categoryId,
      imageUrl: input.imageUrl || DEFAULT_IMAGE,
      description: input.description ?? null,
      position: input.position ?? null,
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
    position?: number | null
  }
) {
  const { categoryId, ...rest } = input
  return prisma.contestant.update({
    where: { id },
    data: {
      ...rest,
      ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
    },
  })
}

export async function deleteNominee(id: string) {
  return prisma.contestant.delete({ where: { id } })
}
