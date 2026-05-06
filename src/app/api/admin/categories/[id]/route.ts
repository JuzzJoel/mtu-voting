import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guards'
import {
  deleteAdminCategory,
  updateAdminCategory,
} from '@/server/services/admin-category-service'
import { categoryUpdateSchema } from '@/server/validators/admin'

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req)
    const { id } = await context.params
    const body = categoryUpdateSchema.parse(await req.json())
    const category = await updateAdminCategory(id, body)
    return NextResponse.json({ category })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req)
    const { id } = await context.params
    await deleteAdminCategory(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
