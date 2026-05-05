import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '@/server/repositories/admin-category-repository'

export function getAdminCategories() {
  return listCategories()
}

export function createAdminCategory(input: {
  title: string
  order: number
  isActive: boolean
}) {
  return createCategory(input)
}

export function updateAdminCategory(
  id: string,
  input: { title?: string; order?: number; isActive?: boolean }
) {
  return updateCategory(id, input)
}

export function deleteAdminCategory(id: string) {
  return deleteCategory(id)
}
