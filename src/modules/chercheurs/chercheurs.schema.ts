import { z } from "zod"

export const createChercheurSchema = z.object({
  name: z.string().min(2),
  specialty: z.string().min(2),
  institutionId: z.string().uuid(),
  institutionName: z.string(),
  faculty: z.string().optional(),
  laboratoireId: z.string().uuid().optional(),
  laboratoireName: z.string().optional(),
  effectif: z.number().int().positive().optional(),
  publications: z.string().optional(),
  partenariats: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  note: z.string().optional(),
  fiche: z.string().optional()
})

export const updateChercheurSchema = createChercheurSchema.partial()

export const chercheurQuerySchema = z.object({
  search: z.string().optional(),
  institution: z.string().optional(),
  laboratoire: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12)
})