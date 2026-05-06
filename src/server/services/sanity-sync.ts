import { prisma } from '@/lib/db/prisma'
import { sanityClient } from '@/lib/sanity/client'
import { categoriesWithNomineesQuery } from '@/lib/sanity/queries'

type SanityNominee = {
  _id: string
  name: string
  imageUrl: string
  description?: string | null
}

type SanityCategory = {
  _id: string
  name: string
  order: number
  nominees: SanityNominee[]
}

export async function syncSanityContent() {
  const categories = await sanityClient.fetch<SanityCategory[]>(
    categoriesWithNomineesQuery
  )

  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { sanityId: category._id },
      update: {
        title: category.name,
        order: category.order,
        isActive: true,
      },
      create: {
        sanityId: category._id,
        title: category.name,
        order: category.order,
        isActive: true,
      },
      select: { id: true },
    })

    for (const nominee of category.nominees) {
      await prisma.contestant.upsert({
        where: { sanityId: nominee._id },
        update: {
          name: nominee.name,
          imageUrl: nominee.imageUrl,
          description: nominee.description ?? null,
          categoryId: record.id,
        },
        create: {
          sanityId: nominee._id,
          name: nominee.name,
          imageUrl: nominee.imageUrl,
          description: nominee.description ?? null,
          categoryId: record.id,
        },
      })
    }
  }
}
