import { Request, Response, NextFunction } from "express"
import { InstitutionsService } from "./institutions.service"
import { createInstitutionSchema, updateInstitutionSchema } from "./institutions.schema"

const institutionsService = new InstitutionsService()

export class InstitutionsController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, page, limit } = req.query
      const result = await institutionsService.findAll({
        search: search as string,
        page: Number(page) || 1,
        limit: Number(limit) || 20
      })
      return res.json(result)
    } catch (error) {
      next(error)
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const institution = await institutionsService.findById(req.params.id as string)
      return res.json(institution)
    } catch (error) {
      next(error)
    }
  }

  async findByAcronym(req: Request, res: Response, next: NextFunction) {
    try {
      const institution = await institutionsService.findByAcronym(req.params.acronym as string)
      return res.json(institution)
    } catch (error) {
      next(error)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createInstitutionSchema.parse(req.body)
      const institution = await institutionsService.create(data)
      return res.status(201).json(institution)
    } catch (error) {
      next(error)
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateInstitutionSchema.parse(req.body)
      const institution = await institutionsService.update(req.params.id as string, data)
      return res.json(institution)
    } catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await institutionsService.delete(req.params.id as string)
      return res.json({ message: "Institution supprimée" })
    } catch (error) {
      next(error)
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await institutionsService.getStats(req.params.id as string)
      return res.json(stats)
    } catch (error) {
      next(error)
    }
  }
}