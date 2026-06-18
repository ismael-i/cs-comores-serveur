import { Router } from "express"
import { ArticlesController } from "./articles.controller"
import { authenticate } from "../../middleware/auth"
import { authorize } from "../../middleware/roles"

const router : Router = Router()
const controller = new ArticlesController()

// Routes publiques
router.get("/", controller.findAll)
// router.get("/recent", controller.getRecent)
// router.get("/tags", controller.getTags)
router.get("/:id", controller.findById)

// Routes admin
router.post("/", authenticate, authorize("ADMIN", "CHERCHEUR"), controller.create)
router.put("/:id", authenticate, authorize("ADMIN", "CHERCHEUR"), controller.update)
router.delete("/:id", authenticate, authorize("ADMIN", "CHERCHEUR"), controller.delete)

export { router as articlesRoutes }