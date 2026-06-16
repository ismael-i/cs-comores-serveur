import { z } from "zod"

export const createLaboratoireSchema = z.object({
  acronym: z.string().min(2).max(10).toUpperCase(),
  name: z.string().min(3),
  description: z.string().min(10),
  categorie: z.enum(["Sciences", "Environnement", "Santé", "Économie", "Lettres"]),
  researchers: z.number().int().positive().default(0),
  institutionId: z.string().uuid(),
  institutionName: z.string(),
  thematiques: z.array(z.string()).default([]),
  responsableId: z.string().uuid().optional(),
  partenariats: z.array(z.string()).default([]),
  logo: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactTelephone: z.string().optional(),
  contactSite: z.string().url().optional(),
  statut: z.enum(["Actif", "Inactif"]).default("Actif")
})

export const updateLaboratoireSchema = createLaboratoireSchema.partial()

export const laboratoireQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  institution: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12)
})