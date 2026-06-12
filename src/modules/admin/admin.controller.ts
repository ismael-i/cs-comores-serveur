import { Request, Response, NextFunction } from "express"
import { AdminService } from "./admin.service"

const adminService = new AdminService()

export class AdminController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats()
      return res.json(stats)
    } catch (error) {
      next(error)
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await adminService.getAllUsers()
      return res.json(users)
    } catch (error) {
      next(error)
    }
  }
}