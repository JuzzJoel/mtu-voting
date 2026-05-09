import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const user = await requireUser()
    const votes = await prisma.vote.findMany({
      where: { userId: user.id },
      include: {
        category: { select: { title: true, order: true } },
        contestant: { select: { name: true, imageUrl: true } },
      },
      orderBy: { category: { order: 'asc' } },
    })

    return NextResponse.json(
      votes.map((v) => ({
        categoryName: v.category.title,
        nominee: { name: v.contestant.name, imageUrl: v.contestant.imageUrl },
      }))
    )
  } catch {
    return NextResponse.json([])
  }
}
