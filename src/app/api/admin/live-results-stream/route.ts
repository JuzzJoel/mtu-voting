import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAdmin } from '@/lib/auth/guards'

export const dynamic = 'force-dynamic'

type CategoryTotal = {
  categoryId: string
  title: string
  order: number
  totalVotes: number
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let closed = false

        const send = (data: unknown) => {
          if (closed) return
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
          } catch {
            closed = true
          }
        }

        const fetchTotals = async (): Promise<CategoryTotal[]> => {
          const [categories, grouped] = await Promise.all([
            prisma.category.findMany({
              where: { isActive: true },
              select: { id: true, title: true, order: true },
              orderBy: { order: 'asc' },
            }),
            prisma.vote.groupBy({
              by: ['categoryId'],
              _count: { _all: true },
            }),
          ])

          const countMap = Object.fromEntries(grouped.map((g) => [g.categoryId, g._count._all]))

          return categories.map((c) => ({
            categoryId: c.id,
            title: c.title,
            order: c.order,
            totalVotes: countMap[c.id] ?? 0,
          }))
        }

        try {
          send(await fetchTotals())

          const interval = setInterval(async () => {
            if (closed) { clearInterval(interval); return }
            try { send(await fetchTotals()) } catch {}
          }, 3000)

          req.signal.addEventListener('abort', () => {
            closed = true
            clearInterval(interval)
            try { controller.close() } catch {}
          })
        } catch (err) {
          console.error('SSE error:', err)
          closed = true
          try { controller.close() } catch {}
        }
      },
    })

    return new NextResponse(stream, { headers })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
