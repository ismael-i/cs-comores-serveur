import { Request, Response, NextFunction } from "express"
import { ChercheursService } from "./chercheurs.service"
import { createChercheurSchema, updateChercheurSchema } from "./chercheurs.schema"

const chercheursService = new ChercheursService()

export class ChercheursController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, institution, laboratoire, page, limit } = req.query
      const result = await chercheursService.findAll({
        search: search as string,
        institution: institution as string,
        laboratoire: laboratoire as string,
        page: Number(page) || 1,
        limit: Number(limit) || 12
      })
      return res.json(result)
    } catch (error) {
      next(error)
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const chercheur = await chercheursService.findById(req.params.id)
      return res.json(chercheur)
    } catch (error) {
      next(error)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createChercheurSchema.parse(req.body)
      const chercheur = await chercheursService.create(data)
      return res.status(201).json(chercheur)
    } catch (error) {
      next(error)
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateChercheurSchema.parse(req.body)
      const chercheur = await chercheursService.update(req.params.id, data)
      return res.json(chercheur)
    } catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await chercheursService.delete(req.params.id)
      return res.json({ message: "Chercheur supprimé" })
    } catch (error) {
      next(error)
    }
  }
}