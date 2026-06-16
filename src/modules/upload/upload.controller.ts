import { Request, Response, NextFunction } from "express"
import { UploadService } from "./upload.service"
import  prisma  from "../../config/database"

const uploadService = new UploadService()

export class UploadController {
  
  /**
   * Upload d'une photo (image) pour un chercheur, labo ou institution
   */
  async uploadPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file
      if (!file) {
        return res.status(400).json({ error: "Aucun fichier" })
      }

      const type = req.body.type // "chercheurs" | "laboratoires" | "institutions"
      const id = req.body.id


      if (!type || !id) {
        return res.status(400).json({ error: "Type et ID requis" })
      }

      // Sauvegarder le chemin relatif du fichier
      const relativePath = await uploadService.saveFile(file, type)
      
      // Construire l'URL complète
      const fileUrl = uploadService.getFileUrl(relativePath)

      // Mettre à jour la base de données avec le chemin RELATIF
      switch (type) {
        case "chercheurs":
          await prisma.chercheur.update({
            where: { id },
            data: { photoUrl: relativePath }  // ← Stocke le chemin relatif
          })
          break
        case "laboratoires":
          await prisma.laboratoire.update({
            where: { id },
            data: { logo: relativePath }
          })
          break
        case "institutions":
          await prisma.institution.update({
            where: { id },
            data: { logo: relativePath }
          })
          break
        default:
          return res.status(400).json({ error: "Type non supporté" })
      }

      return res.json({ 
        url: fileUrl,           // URL complète pour affichage
        path: relativePath      // Chemin relatif stocké en DB
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Upload d'un fichier PDF (fiche chercheur)
   */
  async uploadPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file
      if (!file) {
        return res.status(400).json({ error: "Aucun fichier" })
      }

      const chercheurId = req.body.chercheurId
      if (!chercheurId) {
        return res.status(400).json({ error: "chercheurId requis" })
      }

      // Vérifier que le chercheur existe
      const chercheur = await prisma.chercheur.findUnique({
        where: { id: chercheurId }
      })
      if (!chercheur) {
        return res.status(404).json({ error: "Chercheur non trouvé" })
      }

      // Supprimer l'ancien PDF si existe
      if (chercheur.fiche) {
        await uploadService.deleteFile(chercheur.fiche)
      }

      // Sauvegarder le nouveau PDF
      const relativePath = await uploadService.saveFile(file, "fiches")
      const fileUrl = uploadService.getFileUrl(relativePath)

      // Mettre à jour le chercheur
      await prisma.chercheur.update({
        where: { id: chercheurId },
        data: { fiche: relativePath }  // ← Stocke le chemin relatif
      })

      return res.json({ 
        url: fileUrl, 
        path: relativePath 
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Supprimer une photo
   */
  async deletePhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, id } = req.body

      if (!type || !id) {
        return res.status(400).json({ error: "Type et ID requis" })
      }

      // Récupérer le chemin actuel
      let currentPath: string | null = null

      switch (type) {
        case "chercheurs": {
          const chercheur = await prisma.chercheur.findUnique({ where: { id } })
          currentPath = chercheur?.photoUrl || null
          if (currentPath) {
            await prisma.chercheur.update({
              where: { id },
              data: { photoUrl: null }
            })
          }
          break
        }
        case "laboratoires": {
          const labo = await prisma.laboratoire.findUnique({ where: { id } })
          currentPath = labo?.logo || null
          if (currentPath) {
            await prisma.laboratoire.update({
              where: { id },
              data: { logo: null }
            })
          }
          break
        }
        case "institutions": {
          const inst = await prisma.institution.findUnique({ where: { id } })
          currentPath = inst?.logo || null
          if (currentPath) {
            await prisma.institution.update({
              where: { id },
              data: { logo: null }
            })
          }
          break
        }
      }

      // Supprimer le fichier physique
      if (currentPath) {
        await uploadService.deleteFile(currentPath)
      }

      return res.json({ message: "Photo supprimée" })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Supprimer un PDF
   */
  async deletePDF(req: Request, res: Response, next: NextFunction) {
    try {
      const { chercheurId } = req.body
      if (!chercheurId) {
        return res.status(400).json({ error: "chercheurId requis" })
      }

      const chercheur = await prisma.chercheur.findUnique({
        where: { id: chercheurId }
      })

      if (chercheur?.fiche) {
        await uploadService.deleteFile(chercheur.fiche)
        await prisma.chercheur.update({
          where: { id: chercheurId },
          data: { fiche: null }
        })
      }

      return res.json({ message: "PDF supprimé" })
    } catch (error) {
      next(error)
    }
  }
}