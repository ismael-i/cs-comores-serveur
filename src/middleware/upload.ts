import multer from "multer"
import path from "path"
import { v4 as uuid } from "uuid"
import { AppError } from "../shared/errors/AppError"
import fs from "fs"

// Créer les dossiers s'ils n'existent pas
const uploadDirs = ["chercheurs", "laboratoires", "institutions", "fiches"]
const baseUploadPath = path.join(process.cwd(), "uploads")

// Créer le dossier de base et les sous-dossiers
if (!fs.existsSync(baseUploadPath)) {
  fs.mkdirSync(baseUploadPath, { recursive: true })
}
uploadDirs.forEach(dir => {
  const fullPath = path.join(baseUploadPath, dir)
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
    console.log(`📁 Dossier créé: uploads/${dir}`)
  }
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Récupérer le type depuis le body
    // À ce stade, Multer a déjà parsé les champs texte (car ils sont avant le fichier)
    let type = req.body?.type || "divers"
    
    // Normaliser le type
    const validTypes = ["chercheurs", "laboratoires", "institutions", "fiches"]
    if (!validTypes.includes(type)) {
      console.warn(`⚠️ Type inconnu: "${type}", utilisation de "divers"`)
      type = "divers"
    }

    const uploadPath = path.join(baseUploadPath, type)
    
    // Créer le dossier s'il n'existe pas encore
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
      console.log(`📁 Dossier créé à la volée: uploads/${type}`)
    }

    console.log(`📤 Upload -> uploads/${type}/`)
    cb(null, uploadPath)
  },
  
  filename: (req, file, cb) => {
    // Garder l'extension originale
    const ext = path.extname(file.originalname).toLowerCase()
    // Générer un nom unique
    const filename = `${uuid()}${ext}`
    console.log(`📄 Fichier: ${filename}`)
    cb(null, filename)
  }
})

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accepter images et PDF
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "image/gif",
    "application/pdf"
  ]

  console.log(`🔍 Filtrage: ${file.originalname} (${file.mimetype})`)

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new AppError(400, `Format non supporté: ${file.mimetype}. Utilisez JPG , SVG, PNG, WebP, GIF ou PDF`))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1
  }
})