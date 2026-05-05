import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/guards'
import {
  createAdminCategory,
  getAdminCategories,
} from '@/server/services/admin-category-service'
import { categoryCreateSchema } from '@/server/validators/admin'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)
    const categories = await getAdminCategories()
    return NextResponse.json({ categories })
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req)
    const body = categoryCreateSchema.parse(await req.json())
    const category = await createAdminCategory(body)
    return NextResponse.json({ category })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
