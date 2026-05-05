import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { listCategoriesForUser } from '@/server/services/category-service'

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req)
    const categories = await listCategoriesForUser(user.id)
    return NextResponse.json(categories)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
