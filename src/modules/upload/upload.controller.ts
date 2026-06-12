import { Request, Response, NextFunction } from "express"
import { UploadService } from "./upload.service"
import  prisma  from "../../config/database"
import path from "path"

const uploadService = new UploadService()

export class UploadController {
  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file
      if (!file) {
        return res.status(400).json({ error: "Aucun fichier uploadé" })
      }

      const type = req.body.type // "chercheurs" | "laboratoires" | "institutions"
      const id = req.body.id

      // Traiter l'image
      const processedPath = await uploadService.processImage(file.path, {
        width: 400,
        height: 400,
        quality: 85
      })

      const relativePath = path.relative(
        path.join(__dirname, "../../.."),
        processedPath
      )
      const imageUrl = uploadService.getImageUrl(relativePath)

      // Mettre à jour la base
      if (type === "chercheurs" && id) {
        await prisma.chercheur.update({
          where: { id },
          data: { photoUrl: imageUrl }
        })
      } else if (type === "laboratoires" && id) {
        await prisma.laboratoire.update({
          where: { id },
          data: { logo: imageUrl }
        })
      } else if (type === "institutions" && id) {
        await prisma.institution.update({
          where: { id },
          data: { logo: imageUrl }
        })
      }

      return res.json({ url: imageUrl })
    } catch (error) {
      next(error)
    }
  }
}