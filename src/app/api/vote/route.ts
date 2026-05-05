import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { requireUser } from '@/lib/auth/guards'
import { enforceCsrf } from '@/lib/security/csrf'
import { voteBatchSchema } from '@/lib/security/validators'
import { submitVotes } from '@/server/services/vote-service'

export async function POST(req: NextRequest) {
  try {
    await enforceCsrf(req)
    const user = await requireUser(req)
    const body = voteBatchSchema.parse(await req.json())

    await submitVotes(
      user.id,
      body.votes.map((vote) => ({
        categoryId: vote.categoryId,
        nomineeId: vote.contestantId,
      }))
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'You already voted in this category.' },
        { status: 409 }
      )
    }
    if (error instanceof Error && error.message === 'INVALID_NOMINEE') {
      return NextResponse.json(
        { error: 'Nominee/category mismatch.' },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.message === 'DUPLICATE_CATEGORY') {
      return NextResponse.json(
        { error: 'Duplicate category votes detected.' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Vote failed.' }, { status: 500 })
  }
}
