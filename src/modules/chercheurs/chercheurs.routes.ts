import { Router } from "express"
import { ChercheursController } from "./chercheurs.controller"
import { authenticate } from "../../middleware/auth"
import { authorize } from "../../middleware/roles"

const router : Router = Router()
const controller = new ChercheursController()

// Publiques
router.get("/", controller.findAll)
router.get("/:id", controller.findById)

// Admin seulement
router.post("/", authenticate, authorize("ADMIN"), controller.create)
router.put("/:id", authenticate, authorize("ADMIN"), controller.update)
router.delete("/:id", authenticate, authorize("ADMIN"), controller.delete)

export { router as chercheursRoutes }