import { Router } from "express"
import { InstitutionsController } from "./institutions.controller"
import { authenticate } from "../../middleware/auth"
import { authorize } from "../../middleware/roles"

const router : Router = Router()
const controller = new InstitutionsController()

// Routes publiques
router.get("/", controller.findAll)
router.get("/acronym/:acronym", controller.findByAcronym)
router.get("/:id", controller.findById)
router.get("/:id/stats", controller.getStats)

// Routes admin
router.post("/", authenticate, authorize("ADMIN"), controller.create)
router.put("/:id", authenticate, authorize("ADMIN"), controller.update)
router.delete("/:id", authenticate, authorize("ADMIN"), controller.delete)

export { router as institutionsRoutes }