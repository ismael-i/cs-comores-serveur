import { Router } from "express"
import { UploadController } from "./upload.controller"
import { upload } from "../../middleware/upload"
import { authenticate } from "../../middleware/auth"
import { authorize } from "../../middleware/roles"

const router :Router = Router()
const controller = new UploadController()

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "CHERCHEUR"),
  upload.single("file"),
  controller.uploadImage
)

export { router as uploadRoutes }