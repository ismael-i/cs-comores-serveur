import prisma  from "../../config/database"
import { AppError } from "../../shared/errors/AppError"

export class PublicationsService {
  async findAll(query: {
    search?: string
    domain?: string
    type?: string
    year?: number
    laboratoire?: string
    institution?: string
    page: number
    limit: number
  }) {
    const where: any = {}

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
        { journal: { contains: query.search } },
        { keywords: { some: { keyword: { contains: query.search } } } }
      ]
    }

    if (query.domain) where.domain = query.domain
    if (query.type) where.type = query.type
    if (query.year) where.year = query.year
    if (query.laboratoire) where.laboratoireId = query.laboratoire
    if (query.institution) where.institutionAcronym = query.institution

    const [publications, total] = await Promise.all([
      prisma.publication.findMany({
        where,
        include: {
          laboratoire: { select: { acronym: true, name: true } },
          authors: {
            include: {
              chercheur: { select: { id: true, name: true, photoUrl: true, institution: { select: { acronym: true } }, faculty: true } }
            },
            orderBy: { order: "asc" }
          },
          keywords: true
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { year: "desc" }
      }),
      prisma.publication.count({ where })
    ])

    // reformater pour conserver la structure attendue par le frontend (auteurs plats)
    const data = publications.map(pub => ({
      ...pub,
      authors: pub.authors.map(a => ({
        id: a.chercheur.id,
        name: a.chercheur.name,
        photoUrl: a.chercheur.photoUrl,
        institution: a.chercheur.institution?.acronym,
        faculty: a.chercheur.faculty
      }))
    }))

    return {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit)
      }
    }
  }

  async findById(id: string) {
    const publication = await prisma.publication.findUnique({
      where: { id },
      include: {
        laboratoire: { select: { acronym: true, name: true, institutionName: true } },
        authors: {
          include: {
            chercheur: { select: { id: true, name: true, photoUrl: true, email: true, institution: { select: { acronym: true } }, faculty: true } }
          },
          orderBy: { order: "asc" }
        },
        keywords: true
      }
    })

    if (!publication) throw new AppError(404, "Publication non trouvée")
    return {
      ...publication,
      authors: publication.authors.map(a => ({
        id: a.chercheur.id,
        name: a.chercheur.name,
        photoUrl: a.chercheur.photoUrl,
        email: a.chercheur.email,
        institution: a.chercheur.institution?.acronym,
        faculty: a.chercheur.faculty
      }))
    }
  }

  async create(data: any) {
    const { authorIds, keywords, ...pubData } = data

    // Vérifier que le laboratoire existe
    const labo = await prisma.laboratoire.findUnique({ where: { id: pubData.laboratoireId } })
    if (!labo) throw new AppError(404, "Laboratoire non trouvé")

    // Vérifier que les chercheurs existent
    if (authorIds.length > 0) {
      const chercheurs = await prisma.chercheur.findMany({ where: { id: { in: authorIds } } })
      if (chercheurs.length !== authorIds.length) throw new AppError(400, "Un ou plusieurs chercheurs introuvables")
    }

    const publication = await prisma.publication.create({
      data: {
        ...pubData,
        institutionAcronym: pubData.institutionAcronym || labo.institutionName,
        authors: {
          create: authorIds.map((chercheurId: string, idx: number) => ({
            chercheurId,
            order: idx
          }))
        },
        keywords: {
          create: keywords.map((kw: string) => ({ keyword: kw }))
        }
      },
      include: {
        authors: {
          include: {
            chercheur: { select: { id: true, name: true, photoUrl: true } }
          }
        },
        keywords: true,
        laboratoire: { select: { acronym: true, name: true } }
      }
    })

    return {
      ...publication,
      authors: publication.authors.map(a => ({
        id: a.chercheur.id,
        name: a.chercheur.name,
        photoUrl: a.chercheur.photoUrl
      }))
    }
  }

  async update(id: string, data: any) {
    const publication = await prisma.publication.findUnique({ where: { id } })
    if (!publication) throw new AppError(404, "Publication non trouvée")

    const { authorIds, keywords, ...pubData } = data

    return prisma.$transaction(async (tx) => {
      // Mise à jour des champs simples
      if (Object.keys(pubData).length > 0) {
        await tx.publication.update({ where: { id }, data: pubData })
      }

      // Mise à jour des auteurs
      if (authorIds) {
        await tx.publicationAuthor.deleteMany({ where: { publicationId: id } })
        if (authorIds.length > 0) {
          // Vérifier l'existence des chercheurs
          const chercheurs = await tx.chercheur.findMany({ where: { id: { in: authorIds } } })
          if (chercheurs.length !== authorIds.length) throw new AppError(400, "Un ou plusieurs chercheurs introuvables")

          await tx.publicationAuthor.createMany({
            data: authorIds.map((chercheurId: string, idx: number) => ({
              publicationId: id,
              chercheurId,
              order: idx
            }))
          })
        }
      }

      // Mise à jour des mots-clés
      if (keywords) {
        await tx.publicationKeyword.deleteMany({ where: { publicationId: id } })
        if (keywords.length > 0) {
          await tx.publicationKeyword.createMany({
            data: keywords.map((kw: string) => ({ keyword: kw, publicationId: id }))
          })
        }
      }

      // Retourner l'objet complet
      return this.findById(id)
    })
  }

  async delete(id: string) {
    const publication = await prisma.publication.findUnique({ where: { id } })
    if (!publication) throw new AppError(404, "Publication non trouvée")
    await prisma.publication.delete({ where: { id } })
    return { message: "Publication supprimée" }
  }
}