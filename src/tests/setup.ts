import { beforeAll, afterAll } from "vitest"
import  prisma  from "../config/database"

beforeAll(async () => {
  // Vérifier la connexion à la base
  await prisma.$connect()
})

afterAll(async () => {
  await prisma.$disconnect()
})