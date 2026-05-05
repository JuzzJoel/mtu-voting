import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guards'
import {
  deleteAdminCategory,
  updateAdminCategory,
} from '@/server/services/admin-category-service'
import { categoryUpdateSchema } from '@/server/validators/admin'

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await requireAdmin(req)
    const body = categoryUpdateSchema.parse(await req.json())
    const category = await updateAdminCategory(context.params.id, body)
    return NextResponse.json({ category })
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
    await deleteAdminCategory(context.params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
