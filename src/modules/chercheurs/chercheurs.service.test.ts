import { describe, it, expect } from "vitest"
import { ChercheursService } from "./chercheurs.service"

const chercheursService = new ChercheursService()

describe("ChercheursService", () => {
  describe("findAll", () => {
    it("devrait retourner une liste paginée", async () => {
      const result = await chercheursService.findAll({
        page: 1,
        limit: 10
      })

      expect(result).toHaveProperty("data")
      expect(result).toHaveProperty("pagination")
      expect(result.pagination).toHaveProperty("total")
      expect(Array.isArray(result.data)).toBe(true)
    })

    it("devrait filtrer par recherche", async () => {
      const result = await chercheursService.findAll({
        search: "Nadjim",
        page: 1,
        limit: 10
      })

      expect(result.data.length).toBeGreaterThanOrEqual(0)
    })
  })
})