import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAdmin } from '@/lib/auth/guards'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const [category, votes] = await Promise.all([
      prisma.category.findUnique({
        where: { id },
        include: {
          contestants: {
            select: { id: true, name: true, imageUrl: true },
          },
        },
      }),
      prisma.vote.findMany({
        where: { categoryId: id },
        include: {
          user: { select: { email: true } },
          contestant: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Build vote counts per contestant
    const countMap: Record<string, number> = {}
    for (const v of votes) countMap[v.contestantId] = (countMap[v.contestantId] ?? 0) + 1
    const maxVotes = Math.max(1, ...Object.values(countMap))

    const contestants = category.contestants
      .map((c) => ({
        id: c.id,
        name: c.name,
        imageUrl: c.imageUrl,
        votes: countMap[c.id] ?? 0,
        pct: Math.round(((countMap[c.id] ?? 0) / maxVotes) * 100),
      }))
      .sort((a, b) => b.votes - a.votes)

    const voterLog = votes.map((v) => ({
      email: v.user.email,
      contestantName: v.contestant.name,
      votedAt: v.createdAt.toISOString(),
    }))

    return NextResponse.json({
      category: { id: category.id, title: category.title },
      contestants,
      voterLog,
    })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
