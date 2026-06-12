import { Router } from "express"
import { authenticate } from "../../middleware/auth"
import { authorize } from "../../middleware/roles"

// Créer un controller similaire à chercheurs
// Pour l'instant, on fait une version simplifiée

const router :Router  = Router()

// TODO: Implémenter le controller complet comme pour chercheurs

router.get("/", async (req, res) => {
  // Version simplifiée - à remplacer par le controller
  const { prisma } = require("../../config/database")
  const laboratoires = await prisma.laboratoire.findMany({
    include: { institution: { select: { acronym: true, name: true } } }
  })
  return res.json(laboratoires)
})

export { router as laboratoiresRoutes }