import prisma  from "../../config/database"
import { AppError } from "../../shared/errors/AppError"
import { Prisma } from "@prisma/client"

export class LaboratoiresService {
  async findAll(query: {
    search?: string
    category?: string
    institution?: string
    page: number
    limit: number
  }) {
    const where: Prisma.LaboratoireWhereInput = {}

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { acronym: { contains: query.search, mode: "insensitive" } },
        { thematiques: { hasSome: [query.search] } }
      ]
    }

    if (query.category) {
      where.categorie = query.category as any
    }

    if (query.institution) {
      where.institutionId = query.institution
    }

    const [laboratoires, total] = await Promise.all([
      prisma.laboratoire.findMany({
        where,
        include: {
          institution: { select: { acronym: true, name: true } },
          responsable: { select: { id: true, name: true, photoUrl: true } },
          _count: { select: { chercheurs: true, publications: true } }
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { name: "asc" }
      }),
      prisma.laboratoire.count({ where })
    ])

    return {
      data: laboratoires,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit)
      }
    }
  }

  async findById(id: string) {
    const laboratoire = await prisma.laboratoire.findUnique({
      where: { id },
      include: {
        institution: true,
        responsable: true,
        chercheurs: {
          select: { id: true, name: true, specialty: true, photoUrl: true, email: true }
        },
        publications: {
          include: { authors: true, keywords: true }
        }
      }
    })

    if (!laboratoire) throw new AppError(404, "Laboratoire non trouvé")
    return laboratoire
  }

  async create(data: any) {
    return prisma.laboratoire.create({ data })
  }

  async update(id: string, data: any) {
    const laboratoire = await prisma.laboratoire.findUnique({ where: { id } })
    if (!laboratoire) throw new AppError(404, "Laboratoire non trouvé")
    return prisma.laboratoire.update({ where: { id }, data })
  }

  async delete(id: string) {
    const laboratoire = await prisma.laboratoire.findUnique({ where: { id } })
    if (!laboratoire) throw new AppError(404, "Laboratoire non trouvé")
    return prisma.laboratoire.delete({ where: { id } })
  }
}