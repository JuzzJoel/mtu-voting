import { z } from 'zod'

export const mtuEmailRegex = /^[a-zA-Z0-9._%+-]+@mtu\.edu\.ng$/i

export const requestOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
})

export const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  otp: z.string().regex(/^\d{6}$/),
})

export const onboardingSchema = z.object({
  name: z.string().trim().min(2).max(80),
  level: z.string().trim().min(1).max(30),
  department: z.string().trim().min(1).max(60),
})

export const voteSchema = z.object({
  categoryId: z.string().min(1),
  contestantId: z.string().min(1),
})

export const voteBatchSchema = z.object({
  votes: z.array(voteSchema).min(1),
})
