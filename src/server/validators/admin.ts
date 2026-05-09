import { z } from 'zod'

export const categoryCreateSchema = z.object({
  title: z.string().trim().min(2),
  order: z.number().int().min(0),
  isActive: z.boolean().default(true),
})

export const categoryUpdateSchema = z.object({
  title: z.string().trim().min(2).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

export const nomineeCreateSchema = z.object({
  name: z.string().trim().min(2),
  categoryId: z.string().min(1),
  imageUrl: z.string().url().optional().nullable(),
  description: z.string().trim().max(240).optional().nullable(),
  position: z.number().int().min(1).optional().nullable(),
})

export const nomineeUpdateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  categoryId: z.string().min(1).optional(),
  imageUrl: z.string().url().optional(),
  description: z.string().trim().max(240).optional().nullable(),
  position: z.number().int().min(1).optional().nullable(),
})

export const uploadRequestSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
})
