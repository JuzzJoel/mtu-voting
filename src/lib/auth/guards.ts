import { NextRequest } from 'next/server'
import { readSession } from './session'
import { prisma } from '@/lib/db/prisma'
import { getAdminEmailWhitelist } from '@/lib/auth/admin'

export async function requireUser(_req?: NextRequest) {
  const session = await readSession()
  if (!session?.userId) throw new Error('Unauthorized')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  })
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function requireAdmin(_req?: NextRequest) {
  const session = await readSession()
  if (!session?.userId) throw new Error('Unauthorized')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  })
  if (!user) throw new Error('Forbidden')
  const whitelist = getAdminEmailWhitelist()
  if (whitelist.length > 0) {
    if (!whitelist.includes(user.email.toLowerCase()))
      throw new Error('Forbidden')
    return user
  }
  if (user.role !== 'ADMIN') throw new Error('Forbidden')
  return user
}
