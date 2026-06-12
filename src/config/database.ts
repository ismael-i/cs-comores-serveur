import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dotenv from "dotenv"
import path from "path"

// Charger .env depuis la racine du backend
dotenv.config({ path: path.join(__dirname, "../../.env") })
const dbUrl = new URL(process.env.DATABASE_URL!)


const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "3306"),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
  
}); 
const prismaClientSingleton = () => {
  return new PrismaClient({ adapter, log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"] })
}
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
export default prisma;