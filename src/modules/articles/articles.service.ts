import  prisma  from "../../config/database"
import { AppError } from "../../shared/errors/AppError"

export class ArticlesService {
  async findAll(query: {
    search?: string
    tag?: string
    chercheurId?: string
    laboratoireId?: string
    page: number
    limit: number
  }) {
    const where: any = {}

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
        { tags: { some: { tag: { contains: query.search } } } }
      ]
    }

    if (query.tag) where.tags = { some: { tag: query.tag } }
    if (query.chercheurId) where.chercheurId = query.chercheurId
    if (query.laboratoireId) where.laboratoireId = query.laboratoireId

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          chercheur: { select: { id: true, name: true, photoUrl: true } },
          laboratoire: { select: { id: true, acronym: true, name: true, logo: true } },
          tags: true
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { date: "desc" }
      }),
      prisma.article.count({ where })
    ])

    return {
      data: articles,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit)
      }
    }
  }

  async findById(id: string) {
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        chercheur: { select: { id: true, name: true, photoUrl: true, specialty: true, email: true } },
        laboratoire: { select: { id: true, acronym: true, name: true, logo: true } },
        tags: true
      }
    })

    if (!article) throw new AppError(404, "Article non trouvé")
    return article
  }

  async create(data: any) {
    const { tags, ...articleData } = data

    // Vérifier chercheur et laboratoire si fournis
    if (articleData.chercheurId) {
      const chercheur = await prisma.chercheur.findUnique({ where: { id: articleData.chercheurId } })
      if (!chercheur) throw new AppError(404, "Chercheur non trouvé")
    }
    if (articleData.laboratoireId) {
      const labo = await prisma.laboratoire.findUnique({ where: { id: articleData.laboratoireId } })
      if (!labo) throw new AppError(404, "Laboratoire non trouvé")
    }

    return prisma.article.create({
      data: {
        ...articleData,
        date: new Date(),
        tags: { create: tags.map((tag: string) => ({ tag })) }
      },
      include: {
        chercheur: { select: { id: true, name: true, photoUrl: true } },
        laboratoire: { select: { id: true, acronym: true, name: true } },
        tags: true
      }
    })
  }

  async update(id: string, data: any) {
    const article = await prisma.article.findUnique({ where: { id } })
    if (!article) throw new AppError(404, "Article non trouvé")

    const { tags, ...articleData } = data

    // Vérifications éventuelles
    if (articleData.chercheurId) {
      const chercheur = await prisma.chercheur.findUnique({ where: { id: articleData.chercheurId } })
      if (!chercheur) throw new AppError(404, "Chercheur non trouvé")
    }
    if (articleData.laboratoireId) {
      const labo = await prisma.laboratoire.findUnique({ where: { id: articleData.laboratoireId } })
      if (!labo) throw new AppError(404, "Laboratoire non trouvé")
    }

    return prisma.$transaction(async (tx) => {
      if (Object.keys(articleData).length > 0) {
        await tx.article.update({ where: { id }, data: articleData })
      }

      if (tags) {
        await tx.articleTag.deleteMany({ where: { articleId: id } })
        await tx.articleTag.createMany({
          data: tags.map((tag: string) => ({ tag, articleId: id }))
        })
      }

      return tx.article.findUnique({
        where: { id },
        include: {
          chercheur: { select: { id: true, name: true, photoUrl: true } },
          laboratoire: { select: { id: true, acronym: true, name: true } },
          tags: true
        }
      })
    })
  }

  async delete(id: string) {
    const article = await prisma.article.findUnique({ where: { id } })
    if (!article) throw new AppError(404, "Article non trouvé")
    await prisma.article.delete({ where: { id } })
    return { message: "Article supprimé" }
  }
}