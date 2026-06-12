import sharp from "sharp"
import path from "path"
import fs from "fs/promises"
import { AppError } from "../../shared/errors/AppError"
import { env } from "../../config/env"

export class UploadService {
  async processImage(filePath: string, options?: {
    width?: number
    height?: number
    quality?: number
  }) {
    const { width = 800, height = 800, quality = 80 } = options || {}
    
    const outputPath = filePath.replace(path.extname(filePath), "_processed.webp")
    
    try {
      await sharp(filePath)
        .resize(width, height, { fit: "cover", position: "center" })
        .webp({ quality })
        .toFile(outputPath)

      // Supprimer l'original
      await fs.unlink(filePath)
      // Renommer le fichier traité
      const finalPath = filePath.replace(path.extname(filePath), ".webp")
      await fs.rename(outputPath, finalPath)
      
      return finalPath
    } catch (error) {
      throw new AppError(500, "Erreur lors du traitement de l'image")
    }
  }

  getImageUrl(relativePath: string): string {
    return `${env.API_URL}/${relativePath.replace(/\\/g, "/")}`
  }

  async deleteImage(filePath: string) {
    try {
      await fs.unlink(filePath)
    } catch {
      // Ignorer si le fichier n'existe pas
    }
  }
}