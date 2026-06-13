import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères")
})

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères")
    .regex(/[A-Z]/, "Doit contenir une majuscule")
    .regex(/[0-9]/, "Doit contenir un chiffre"),
  name: z.string().min(2, "Nom requis"),
  institution: z.string().min(2, "Institution requise"),
})

// Nouveau schéma pour la route de validation admin
export const ValidateRegistrationSchema = z.object({
  chercheurId: z.string().uuid("chercheurId invalide"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ValidateRegistrationInput = z.infer<typeof ValidateRegistrationSchema>