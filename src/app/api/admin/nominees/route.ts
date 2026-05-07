import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { requireAdmin } from '@/lib/auth/guards'
import {
  createAdminNominee,
  getAdminNominees,
} from '@/server/services/admin-nominee-service'
import { nomineeCreateSchema } from '@/server/validators/admin'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)
    const nominees = await getAdminNominees()
    return NextResponse.json({ nominees })
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const body = nomineeCreateSchema.parse(await req.json())
    const nominee = await createAdminNominee(body)
    return NextResponse.json({ nominee })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A nominee with that name already exists in this category.' },
        { status: 409 }
      )
    }
    const message = error instanceof Error ? error.message : 'Invalid request'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
