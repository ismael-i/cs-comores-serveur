import { z } from "zod"

export const publicationAuthorSchema = z.object({
  name: z.string().min(2),
  institution: z.string().optional(),
  faculty: z.string().optional()
})

export const createPublicationSchema = z.object({
  title: z.string().min(5),
  domain: z.enum(["Environnement", "Sciences", "Santé", "Économie", "Lettres"]),
  year: z.number().int().min(1900).max(2030),
  type: z.enum(["Article_Scientifique", "Communication_De_Conference"]),
  journal: z.string().min(3),
  description: z.string().min(20),
  laboratoireId: z.string().uuid(),
  institutionAcronym: z.string().optional(),
  pdfUrl: z.string().url().optional(),
  authorIds: z.array(z.string().uuid()).min(1, "Au moins un auteur requis"),
  keywords: z.array(z.string().min(2)).min(1, "Au moins un mot‑clé requis")
})

export const updatePublicationSchema = createPublicationSchema.partial()

export const publicationQuerySchema = z.object({
  search: z.string().optional(),
  domain: z.string().optional(),
  type: z.string().optional(),
  year: z.coerce.number().int().optional(),
  laboratoire: z.string().uuid().optional(),
  institution: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12)
})