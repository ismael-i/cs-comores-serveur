import dotenv from "dotenv"
import path from "path"

// Charger .env depuis la racine du backend
dotenv.config({ path: path.join(__dirname, "../../.env") })

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3150"),
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET || "cbVN+MW3o1o8h/scTTaxAgj1cWh3xyLnehuc8lieChw=",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  API_URL: process.env.API_URL || "http://localhost:3150",
  
  // Email (optionnel en dev)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587"),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM || "noreply@catalogue-comores.km",
  CONTACT_EMAIL: process.env.CONTACT_EMAIL || "admin@catalogue-comores.km"
}