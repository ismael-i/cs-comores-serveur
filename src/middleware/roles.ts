import { Request, Response, NextFunction } from "express"

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Non authentifié" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Accès refusé. Rôle requis : ${roles.join(" ou ")}` 
      })
    }

    next()
  }
}