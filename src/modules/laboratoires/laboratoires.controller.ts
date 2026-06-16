import { Request, Response, NextFunction } from "express"
import { LaboratoiresService } from "./laboratoires.service"
import { createLaboratoireSchema, updateLaboratoireSchema } from "./laboratoires.schema"

const laboratoiresService = new LaboratoiresService()

export class LaboratoiresController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, category, institution, page, limit } = req.query
      const result = await laboratoiresService.findAll({
        search: search as string,
        category: category as string,
        institution: institution as string,
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
      const laboratoire = await laboratoiresService.findById(req.params.id as string)
      return res.json(laboratoire)
    } catch (error) {
      next(error)
    }
  }

  async findByAcronym(req: Request, res: Response, next: NextFunction) {
    try {
      const laboratoire = await laboratoiresService.findByAcronym(req.params.acronym as string)
      return res.json(laboratoire)
    } catch (error) {
      next(error)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createLaboratoireSchema.parse(req.body)
      const laboratoire = await laboratoiresService.create(data)
      return res.status(201).json(laboratoire)
    } catch (error) {
      next(error)
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateLaboratoireSchema.parse(req.body)
      const laboratoire = await laboratoiresService.update(req.params.id as string, data)
      return res.json(laboratoire)
    } catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await laboratoiresService.delete(req.params.id as string)
      return res.json({ message: "Laboratoire supprimé" })
    } catch (error) {
      next(error)
    }
  }

  async getChercheurs(req: Request, res: Response, next: NextFunction) {
    try {
      const chercheurs = await laboratoiresService.getChercheurs(req.params.id as string)
      return res.json(chercheurs)
    } catch (error) {
      next(error)
    }
  }

  async getPublications(req: Request, res: Response, next: NextFunction) {
    try {
      const publications = await laboratoiresService.getPublications(req.params.id as string)
      return res.json(publications)
    } catch (error) {
      next(error)
    }
  }
}