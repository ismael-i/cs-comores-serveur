import { Request, Response, NextFunction } from "express"
import { verifyToken, JwtPayload } from "../shared/utils/jwt"

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token manquant" })
  }

  try {
    const token = authHeader.split(" ")[1]
    req.user = verifyToken(token)
    next()
  } catch {
    return res.status(401).json({ error: "Token invalide ou expiré" })
  }
}