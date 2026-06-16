import { Request, Response, NextFunction } from "express"
import { ArticlesService } from "./articles.service"
import { createArticleSchema, updateArticleSchema } from "./articles.schema"

const articlesService = new ArticlesService()

export class ArticlesController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, tag, author, page, limit } = req.query
      const result = await articlesService.findAll({
        search: search as string,
        tag: tag as string,
        author: author as string,
        page: Number(page) || 1,
        limit: Number(limit) || 10
      })
      return res.json(result)
    } catch (error) {
      next(error)
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const article = await articlesService.findById(req.params.id as string)
      return res.json(article)
    } catch (error) {
      next(error)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createArticleSchema.parse(req.body)
      const article = await articlesService.create(data)
      return res.status(201).json(article)
    } catch (error) {
      next(error)
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateArticleSchema.parse(req.body)
      const article = await articlesService.update(req.params.id as string, data)
      return res.json(article)
    } catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await articlesService.delete(req.params.id as string)
      return res.json({ message: "Article supprimé" })
    } catch (error) {
      next(error)
    }
  }

  async getRecent(req: Request, res: Response, next: NextFunction) {
    try {
      const articles = await articlesService.getRecent(
        Number(req.query.limit) || 5
      )
      return res.json(articles)
    } catch (error) {
      next(error)
    }
  }

  async getTags(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await articlesService.getTags()
      return res.json(tags)
    } catch (error) {
      next(error)
    }
  }
}