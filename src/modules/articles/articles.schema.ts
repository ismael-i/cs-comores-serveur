import { z } from "zod"
export const createArticleSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  imageUrl: z.string().url().optional(),
  imageAlt: z.string().optional(),
  body: z.array(z.string().min(5)).min(1, "Au moins un paragraphe requis"),
  chercheurId: z.string().uuid().optional(),        // auteur
  laboratoireId: z.string().uuid().optional(),      // laboratoire lié
  tags: z.array(z.string().min(2)).min(1, "Au moins un tag requis")
})

export const updateArticleSchema = createArticleSchema.partial()

export const articleQuerySchema = z.object({
  search: z.string().optional(),
  tag: z.string().optional(),
  author: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10)
})