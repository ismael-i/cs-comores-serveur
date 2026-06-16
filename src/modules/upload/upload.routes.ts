import { Router } from "express"
import { UploadController } from "./upload.controller"
import { upload } from "../../middleware/upload"
import { authenticate } from "../../middleware/auth"
import { authorize } from "../../middleware/roles"

const router : Router = Router()
const controller = new UploadController()

// Upload photo (admin ou chercheur)
router.post(
  "/photo",
  authenticate,
  authorize("ADMIN", "CHERCHEUR"),
  upload.single("file"),
  controller.uploadPhoto
)

// Upload PDF (admin ou chercheur)
router.post(
  "/pdf",
  authenticate,
  authorize("ADMIN", "CHERCHEUR"),
  upload.single("file"),
  controller.uploadPDF
)

// Supprimer photo (admin)
router.delete(
  "/photo",
  authenticate,
  authorize("ADMIN"),
  controller.deletePhoto
)

// Supprimer PDF (admin)
router.delete(
  "/pdf",
  authenticate,
  authorize("ADMIN"),
  controller.deletePDF
)

export { router as uploadRoutes }