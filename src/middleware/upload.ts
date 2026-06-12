import multer from "multer"
import path from "path"
import { v4 as uuid } from "uuid"
import { AppError } from "../shared/errors/AppError"

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type || "divers"
    const uploadPath = path.join(__dirname, "../../uploads", type)
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const filename = `${uuid()}${ext}`
    cb(null, filename)
  }
})

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new AppError(400, "Format d'image non supporté. Utilisez JPG, PNG, WebP ou GIF"))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  }
})