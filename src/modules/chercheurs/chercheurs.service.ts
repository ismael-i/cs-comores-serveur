import prisma  from "../../config/database"
import { AppError } from "../../shared/errors/AppError"
import { Prisma } from "@prisma/client"

export class ChercheursService {
  async findAll(query: {
    search?: string
    institution?: string
    laboratoire?: string
    page: number
    limit: number
  }) {
    const where: Prisma.ChercheurWhereInput = {}

    if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { specialty: { contains: query.search } },
      { institutionName: { contains: query.search } },
      {laboratoireName: { contains: query.search } }
    ]
  }

    if (query.institution) {
      where.institutionId = query.institution
    }

    if (query.laboratoire) {
      where.laboratoireId = query.laboratoire
    }

    const [chercheurs, total] = await Promise.all([
      prisma.chercheur.findMany({
        where,
        include: {
          institution: { select: {id: true , acronym: true, name: true } },
          laboratoire: { select: {id: true,  acronym: true, name: true } }
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { name: "asc" }
      }),
      prisma.chercheur.count({ where })
    ])

    return {
      data: chercheurs,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit)
      }
    }
  }

  async findById(id: string) {
    const chercheur = await prisma.chercheur.findUnique({
      where: { id },
      include: {
        institution: true,
        laboratoire: {
          include: {
            publications: {
              include: {
                authors: true,
                keywords: true
              }
            }
          }
        }
      }
    })

    if (!chercheur) throw new AppError(404, "Chercheur non trouvé")
    return chercheur
  }

  async create(data: any) {
    return prisma.chercheur.create({ data })
  }

  async update(id: string, data: any) {
    const chercheur = await prisma.chercheur.findUnique({ where: { id } })
    if (!chercheur) throw new AppError(404, "Chercheur non trouvé")

    return prisma.chercheur.update({
      where: { id },
      data
    })
  }

  async delete(id: string) {
    const chercheur = await prisma.chercheur.findUnique({ where: { id } })
    if (!chercheur) throw new AppError(404, "Chercheur non trouvé")

    // Supprimer le compte utilisateur associé
    await prisma.user.deleteMany({ where: { chercheurId: id } })
    
    return prisma.chercheur.delete({ where: { id } })
  }
}