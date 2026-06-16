import express from "express"
import cors from "cors"
import path from "path"
import { env } from "./config/env"

// Routes
import { authRoutes } from "./modules/auth/auth.routes"
import { chercheursRoutes } from "./modules/chercheurs/chercheurs.routes"
import { laboratoiresRoutes } from "./modules/laboratoires/laboratoires.routes"
import { institutionsRoutes } from "./modules/institutions/institutions.routes"
import { publicationsRoutes } from "./modules/publications/publications.routes"
import { articlesRoutes } from "./modules/articles/articles.routes"
import { uploadRoutes } from "./modules/upload/upload.routes"
import { adminRoutes } from "./modules/admin/admin.routes"

// Middleware d'erreur
import { errorHandler } from "./shared/errors/AppError"
import prisma  from "./config/database"

const app = express()

// ─── Middlewares globaux ─────────────────
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true
}))
app.use(express.json({ limit: "10mb" }))

// ─── Servir les fichiers uploadés ────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

// ─── Routes API ──────────────────────────
const API_PREFIX = "/api"

// Health check
app.get(`${API_PREFIX}/health`, (_, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uptime: process.uptime()
  })
})

// Modules
app.use(`${API_PREFIX}/auth`, authRoutes)
app.use(`${API_PREFIX}/chercheurs`, chercheursRoutes)
app.use(`${API_PREFIX}/laboratoires`, laboratoiresRoutes)
app.use(`${API_PREFIX}/institutions`, institutionsRoutes)
app.use(`${API_PREFIX}/publications`, publicationsRoutes)
app.use(`${API_PREFIX}/articles`, articlesRoutes)
app.use(`${API_PREFIX}/upload`, uploadRoutes)
app.use(`${API_PREFIX}/admin`, adminRoutes)

// ─── Documentation rapide des routes ─────
app.get(API_PREFIX, (_, res) => {
  res.json({
    name: "Catalogue Scientifique des Comores - API",
    version: "1.0.0",
    endpoints: {
      auth: `${API_PREFIX}/auth`,
      chercheurs: `${API_PREFIX}/chercheurs`,
      laboratoires: `${API_PREFIX}/laboratoires`,
      institutions: `${API_PREFIX}/institutions`,
      publications: `${API_PREFIX}/publications`,
      articles: `${API_PREFIX}/articles`,
      upload: `${API_PREFIX}/upload`,
      admin: `${API_PREFIX}/admin`
    }
  })
})

// ─── 404 ──────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route non trouvée",
    method: req.method,
    path: req.path 
  })
})

// ─── Error handler ────────────────────────
app.use(errorHandler)

// ─── Démarrage du serveur ────────────────
const server = app.listen(env.PORT, () => {
  console.log("\n🚀 ───────────────────────────────────")
  console.log(`   Serveur démarré sur http://localhost:${env.PORT}`)
  console.log(`   Environnement : ${env.NODE_ENV}`)
  console.log(`   Frontend      : ${env.FRONTEND_URL}`)
  console.log(`   API           : http://localhost:${env.PORT}/api`)
  console.log("──────────────────────────────────────")
  
  console.log("\n📋 Routes disponibles :")
  console.log(`   ${env.API_URL}/api/auth/login`)
  console.log(`   ${env.API_URL}/api/chercheurs`)
  console.log(`   ${env.API_URL}/api/laboratoires`)
  console.log(`   ${env.API_URL}/api/institutions`)
  console.log(`   ${env.API_URL}/api/publications`)
  console.log(`   ${env.API_URL}/api/articles`)
  console.log(`   ${env.API_URL}/api/admin/stats`)
  console.log("──────────────────────────────────────\n")
})

// ─── Graceful shutdown ────────────────────
async function gracefulShutdown(signal: string) {
  console.log(`\n🛑 Signal ${signal} reçu. Arrêt du serveur...`)
  await prisma.$disconnect()
  console.log("✅ Connexion Prisma fermée")
  server.close(() => {
    console.log("✅ Serveur arrêté")
    process.exit(0)
  })
  
  // Force exit après 10s
  setTimeout(() => {
    console.error("⚠️ Arrêt forcé après timeout")
    process.exit(1)
  }, 10000)
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"))
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))

export default app