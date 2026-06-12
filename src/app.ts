import express from "express"
import cors from "cors"
import path from "path"
import { env } from "./config/env"

// Routes
import { authRoutes } from "./modules/auth/auth.routes"
import { chercheursRoutes } from "./modules/chercheurs/chercheurs.routes"
import { laboratoiresRoutes } from "./modules/laboratoires/laboratoires.routes"
import { uploadRoutes } from "./modules/upload/upload.routes"
import { adminRoutes } from "./modules/admin/admin.routes"

// Middleware d'erreur
import { errorHandler } from "./shared/errors/AppError"

const app = express()

// ─── Middlewares globaux ─────────────────
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true
}))
app.use(express.json({ limit: "10mb" }))

// ─── Servir les fichiers uploadés ────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

// ─── Routes ──────────────────────────────
app.get("/api/health", (_, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  })
})

app.use("/api/auth", authRoutes)
app.use("/api/chercheurs", chercheursRoutes)
app.use("/api/laboratoires", laboratoiresRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/admin", adminRoutes)

// ─── 404 ──────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} non trouvée` })
})

// ─── Error handler ────────────────────────
app.use(errorHandler)

// ─── Démarrage ────────────────────────────
app.listen(env.PORT, () => {
  console.log("\n🚀 ───────────────────────────────────")
  console.log(`   Backend démarré sur http://localhost:${env.PORT}`)
  console.log(`   Environnement: ${env.NODE_ENV}`)
  console.log(`   Frontend: ${env.FRONTEND_URL}`)
  console.log("──────────────────────────────────────\n")
})

export default app