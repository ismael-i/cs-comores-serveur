import { Request, Response, NextFunction } from "express"
import { PublicationsService } from "./publications.service"
import { createPublicationSchema, updatePublicationSchema } from "./publications.schema"
import prisma from "../../config/database"

const publicationsService = new PublicationsService()

export class PublicationsController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, domain, type, year, laboratoire, institution, page, limit } = req.query
      const result = await publicationsService.findAll({
        search: search as string,
        domain: domain as string,
        type: type as string,
        year: year ? Number(year) : undefined,
        laboratoire: laboratoire as string,
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
      const publication = await publicationsService.findById(req.params.id as string)
      return res.json(publication)
    } catch (error) {
      next(error)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPublicationSchema.parse(req.body)
      const publication = await publicationsService.create(data)
      return res.status(201).json(publication)
    } catch (error) {
      next(error)
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const pubId = req.params.id as string

      // Vérification de propriété pour le chercheur
      if (req.user?.role === "CHERCHEUR") {
        const publication = await prisma.publication.findUnique({
          where: { id: pubId },
          include: { authors: true }
        })
        if (!publication) {
          return res.status(404).json({ error: "Publication non trouvée" })
        }
        // Vérifier que le chercheur fait partie des auteurs
        const isAuthor = publication.authors.some(a => a.chercheurId === req.user!.chercheurId)
        if (!isAuthor) {
          return res.status(403).json({ error: "Vous ne pouvez modifier que vos propres publications." })
        }
      }
      const data = updatePublicationSchema.parse(req.body)
      const publication = await publicationsService.update(req.params.id as string, data)
      return res.json(publication)
    } catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
       const pubId = req.params.id as string

      if (req.user?.role === "CHERCHEUR") {
        const publication = await prisma.publication.findUnique({
          where: { id: pubId },
          include: { authors: true }
        })
        if (!publication) {
          return res.status(404).json({ error: "Publication non trouvée" })
        }
        const isAuthor = publication.authors.some(a => a.chercheurId === req.user!.chercheurId)
        if (!isAuthor) {
          return res.status(403).json({ error: "Vous ne pouvez supprimer que vos propres publications." })
        }
      }

      await publicationsService.delete(req.params.id as string)
      return res.json({ message: "Publication supprimée" })
    } catch (error) {
      next(error)
    }
  }

  // async getStats(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const stats = await publicationsService.getStats()
  //     return res.json(stats)
  //   } catch (error) {
  //     next(error)
  //   }
  // }
}