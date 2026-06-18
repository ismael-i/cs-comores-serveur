import  prisma  from "../../config/database"
import { AppError } from "../../shared/errors/AppError"
import { Prisma } from "@prisma/client"

export class InstitutionsService {
  async findAll(query: { search?: string; page: number; limit: number }) {
    const where: Prisma.InstitutionWhereInput = {}

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { acronym: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } }
      ]
    }

    const [institutions, total] = await Promise.all([
      prisma.institution.findMany({
        where,
        include: {
          _count: { select: { chercheurs: true, laboratoires: true } }
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { name: "asc" }
      }),
      prisma.institution.count({ where })
    ])

    return {
      data: institutions,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit)
      }
    }
  }

  async findById(id: string) {
    const institution = await prisma.institution.findUnique({
      where: { id },
      include: {
        chercheurs: {
          select: { id: true, name: true, specialty: true, photoUrl: true, email: true }
        },
        laboratoires: {
          select: {
            id: true, acronym: true, name: true, categorie: true,
            researchers: true, statut: true, logo: true, description: true
          }
        },
        _count: { select: { chercheurs: true, laboratoires: true } }
      }
    })

    if (!institution) throw new AppError(404, "Institution non trouvée")
    return institution
  }

  async findByAcronym(acronym: string) {
    const institution = await prisma.institution.findUnique({
      where: { acronym },
      include: {
        chercheurs: {
          select: { id: true, name: true, specialty: true, photoUrl: true, email: true }
        },
        laboratoires: {
          select: {
            id: true, acronym: true, name: true, categorie: true,
            researchers: true, statut: true, logo: true, description: true
          }
        },
        _count: { select: { chercheurs: true, laboratoires: true } }
      }
    })

    if (!institution) throw new AppError(404, "Institution non trouvée")
    return institution
  }

  async create(data: any) {
    const existing = await prisma.institution.findUnique({
      where: { acronym: data.acronym }
    })
    if (existing) {
      throw new AppError(400, `L'acronyme "${data.acronym}" est déjà utilisé`)
    }

    return prisma.institution.create({ data })
  }

  async update(id: string, data: any) {
    const institution = await prisma.institution.findUnique({ where: { id } })
    if (!institution) throw new AppError(404, "Institution non trouvée")

    return prisma.institution.update({
      where: { id },
      data
    })
  }

  async delete(id: string) {
    const institution = await prisma.institution.findUnique({
      where: { id },
      include: {
        _count: { select: { chercheurs: true, laboratoires: true } }
      }
    })
    
    if (!institution) throw new AppError(404, "Institution non trouvée")
    
    if (institution._count.chercheurs > 0 || institution._count.laboratoires > 0) {
      throw new AppError(400,
        `Impossible de supprimer : ${institution._count.chercheurs} chercheur(s) et ${institution._count.laboratoires} laboratoire(s) sont rattachés`
      )
    }

    return prisma.institution.delete({ where: { id } })
  }

  async getStats(id: string) {
    const institution = await prisma.institution.findUnique({ where: { id } })
    if (!institution) throw new AppError(404, "Institution non trouvée")

    const [totalChercheurs, totalLabos, labosByCategory] = await Promise.all([
      prisma.chercheur.count({ where: { institutionId: id } }),
      prisma.laboratoire.count({ where: { institutionId: id } }),
      prisma.laboratoire.groupBy({
        by: ["categorie"],
        where: { institutionId: id },
        _count: true
      })
    ])

    return {
      institution: institution.name,
      totalChercheurs,
      totalLabos,
      labosByCategory
    }
  }
}