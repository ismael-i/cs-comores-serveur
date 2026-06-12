import { Router } from "express"
import { AdminController } from "./admin.controller"
import { authenticate } from "../../middleware/auth"
import { authorize } from "../../middleware/roles"

const router :Router = Router()
const controller = new AdminController()

router.use(authenticate, authorize("ADMIN"))

router.get("/stats", controller.getStats)
router.get("/users", controller.getUsers)

export { router as adminRoutes }