import { Request, Response, NextFunction } from "express"
import { AuthService } from "./auth.service"
import { loginSchema, registerSchema, ValidateRegistrationSchema } from "./auth.schema"

const authService = new AuthService()

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body)
      const result = await authService.login(data)
      
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      
      return res.json(result)
    } catch (error) {
      next(error)
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body)
      const result = await authService.register(data)
      return res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await authService.getProfile(req.user!.userId)
      return res.json(profile)
    } catch (error) {
      next(error)
    }
  }

  async logout(_: Request, res: Response) {
    res.clearCookie("token")
    return res.json({ message: "Déconnecté" })
  }

async validateRegistration(req: Request, res: Response, next: NextFunction) {
  try {
    const { chercheurId } = ValidateRegistrationSchema.parse(req.body)
    const userId = req.params.userId as string

    const result = await authService.validateRegistration(
      userId,
      req.user!.userId,
      chercheurId
    )
    return res.json(result)
  } catch (error) {
    next(error)
  }
}

  async rejectRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body
      if (!reason?.trim()) {
        return res.status(400).json({ error: "Le motif de rejet est obligatoire" })
      }
      const result = await authService.rejectRegistration(
        req.params.userId as string,
        req.user!.userId,
        reason
      )
      return res.json(result)
    } catch (error) {
      next(error)
    }
  }

  async activateAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query
      if (!token || typeof token !== "string") {
        return res.status(400).json({ error: "Token manquant" })
      }
      const result = await authService.activateAccount(token)
      return res.json(result)
    } catch (error) {
      next(error)
    }
  }

  async getPendingRegistrations(req: Request, res: Response, next: NextFunction) {
    try {
      const pendingUsers = await authService.getPendingRegistrations()
      return res.json(pendingUsers)
    } catch (error) {
      next(error)
    }
  }
}