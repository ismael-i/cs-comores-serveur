import { z } from "zod"

export const createInstitutionSchema = z.object({
  acronym: z.string().min(2).max(10).toUpperCase(),
  name: z.string().min(3),
  description: z.string().min(10),
  logo: z.string().url().optional(),
  logoBg: z.string().optional() // classe Tailwind ex: "bg-blue-100"
})

export const updateInstitutionSchema = createInstitutionSchema.partial()

export const institutionQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
})