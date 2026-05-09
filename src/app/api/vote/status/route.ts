import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const user = await requireUser()
    const voteCount = await prisma.vote.count({ where: { userId: user.id } })
    return NextResponse.json({ hasVoted: voteCount > 0, voteCount })
  } catch {
    return NextResponse.json({ hasVoted: false, voteCount: 0 })
  }
}
