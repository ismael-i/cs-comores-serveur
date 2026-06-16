import { describe, it, expect, beforeAll } from "vitest"
import { AuthService } from "./auth.service"
import prisma  from "../../config/database"

const authService = new AuthService()

describe("AuthService", () => {
  const testUser = {
    email: "test@example.com",
    password: "Test123!",
    name: "Test User",
    institution : "Test University",
  }

  beforeAll(async () => {
    // Nettoyer les données de test
    await prisma.user.deleteMany({ where: { email: testUser.email } })
  }),

  describe("register", () => {
    it("devrait créer un compte avec statut PENDING", async () => {
      const result = await authService.register(testUser)
      expect(result.status).toBe("PENDING")
      expect(result.message).toBeDefined()
    })

    it("devrait rejeter un email déjà utilisé", async () => {
      await expect(
        authService.register(testUser)
      ).rejects.toThrow("Cet email est déjà utilisé")
    })
  })

  describe("login", () => {
    it("devrait rejeter un compte non activé", async () => {
      await expect(
        authService.login({ email: testUser.email, password: testUser.password })
      ).rejects.toThrow("en attente de validation")
    })
  })
})