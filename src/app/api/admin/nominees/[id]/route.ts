import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guards'
import {
  deleteAdminNominee,
  updateAdminNominee,
} from '@/server/services/admin-nominee-service'
import { nomineeUpdateSchema } from '@/server/validators/admin'

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await requireAdmin(req)
    const body = nomineeUpdateSchema.parse(await req.json())
    const nominee = await updateAdminNominee(context.params.id, body)
    return NextResponse.json({ nominee })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await requireAdmin(req)
    await deleteAdminNominee(context.params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
