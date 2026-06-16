import path from "path"
import fs from "fs/promises"
import { AppError } from "../../shared/errors/AppError"
import { env } from "../../config/env"

export class UploadService {
  
  /**
   * Sauvegarde un fichier et retourne juste le nom du fichier
   */
  async saveFile(file: Express.Multer.File, type: string): Promise<string> {
    // Le fichier est déjà sauvegardé par multer
    // On retourne juste le chemin relatif pour le stocker en DB
    
    // Construire le chemin relatif : uploads/chercheurs/uuid.jpg
    const relativePath = `uploads/${type}/${file.filename}`
    
    return relativePath
  }

  /**
   * Retourne l'URL complète pour accéder au fichier
   */
  getFileUrl(relativePath: string): string {
    if (!relativePath) return ""
    return `${env.API_URL}/${relativePath}`
  }

  /**
   * Supprime un fichier
   */
  async deleteFile(relativePath: string) {
    if (!relativePath) return
    
    const absolutePath = path.join(process.cwd(), relativePath)
    
    try {
      await fs.unlink(absolutePath)
      console.log(`🗑️ Fichier supprimé: ${relativePath}`)
    } catch (error: any) {
      // Ignorer si le fichier n'existe pas
      if (error.code !== "ENOENT") {
        console.error(`Erreur suppression fichier ${relativePath}:`, error)
      }
    }
  }
}