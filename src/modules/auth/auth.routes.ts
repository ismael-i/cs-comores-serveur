import { Router } from "express"
import { AuthController } from "./auth.controller"
import { authenticate } from "../../middleware/auth"
import { authorize } from "../../middleware/roles"

const router: Router = Router()
const controller = new AuthController()

// Publiques
router.post("/register", controller.register)
router.post("/login", controller.login)
router.get("/activate", controller.activateAccount)

// Protégées
router.get("/profile", authenticate, controller.getProfile)
router.post("/logout", authenticate, controller.logout)

// Admin
router.get(
  "/admin/pending-registrations",
  authenticate,
  authorize("ADMIN"),
  controller.getPendingRegistrations
)
router.post(
  "/admin/validate/:userId",
  authenticate,
  authorize("ADMIN"),
  controller.validateRegistration
)
router.post(
  "/admin/reject/:userId",
  authenticate,
  authorize("ADMIN"),
  controller.rejectRegistration
)

export { router as authRoutes }