export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

import { Request, Response, NextFunction } from "express"

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message
    })
  }

  console.error("❌ Erreur inattendue:", err)
  return res.status(500).json({
    status: "error",
    message: "Erreur interne du serveur"
  })
}