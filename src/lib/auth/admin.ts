import { env } from '@/lib/env'

export function getAdminEmailWhitelist() {
  const emails = new Set<string>()
  if (env.ADMIN_EMAIL) emails.add(env.ADMIN_EMAIL.toLowerCase())
  if (env.ADMIN_EMAILS) {
    env.ADMIN_EMAILS.split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
      .forEach((email) => emails.add(email))
  }
  return Array.from(emails)
}

export function isAdminEmail(email: string) {
  const whitelist = getAdminEmailWhitelist()
  if (whitelist.length === 0) return false
  return whitelist.includes(email.toLowerCase())
}
