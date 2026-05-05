import {
  createNominee,
  deleteNominee,
  listNominees,
  updateNominee,
} from '@/server/repositories/admin-nominee-repository'

export function getAdminNominees() {
  return listNominees()
}

export function createAdminNominee(input: {
  name: string
  categoryId: string
  imageUrl: string
  description?: string | null
}) {
  return createNominee(input)
}

export function updateAdminNominee(
  id: string,
  input: {
    name?: string
    categoryId?: string
    imageUrl?: string
    description?: string | null
  }
) {
  return updateNominee(id, input)
}

export function deleteAdminNominee(id: string) {
  return deleteNominee(id)
}
