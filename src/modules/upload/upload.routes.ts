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

// Upload PDF pour une publication
router.post(
  "/publication-pdf",
  authenticate,
  authorize("ADMIN", "CHERCHEUR"),
  upload.single("file"),
  controller.uploadPublicationPDF
)

// Supprimer le PDF d'une publication
router.delete(
  "/publication-pdf",
  authenticate,
  authorize("ADMIN"),
  controller.deletePublicationPDF
)

export { router as uploadRoutes }