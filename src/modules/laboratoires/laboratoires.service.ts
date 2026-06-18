import  prisma  from "../../config/database"
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
        { description: { contains: query.search, mode: "insensitive" } },
        { thematiques: { hasSome: query.search.split(" ").filter(Boolean) } }
      ]
    }

    if (query.category && query.category !== "Toutes") {
      where.categorie = query.category as any
    }

    if (query.institution) {
      where.institutionId = query.institution
    }

    const [laboratoires, total] = await Promise.all([
      prisma.laboratoire.findMany({
        where,
        include: {
          institution: { select: { acronym: true, name: true, logo: true } },
          responsable: { select: { id: true, name: true, photoUrl: true, email: true } },
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
          select: {
            id: true, name: true, specialty: true,
            photoUrl: true, email: true, phone: true, faculty: true
          }
        },
        publications: {
          include: {
            authors: true,
            keywords: true
          },
          orderBy: { year: "desc" }
        },
         _count: { select: { chercheurs: true, publications: true } }
      }
    })

    if (!laboratoire) throw new AppError(404, "Laboratoire non trouvé")
    return laboratoire
  }

  async findByAcronym(acronym: string) {
    const laboratoire = await prisma.laboratoire.findUnique({
      where: { acronym },
      include: {
        institution: true,
        responsable: true,
        chercheurs: {
          select: { id: true, name: true, specialty: true, photoUrl: true, email: true }
        }
      }
    })

    if (!laboratoire) throw new AppError(404, "Laboratoire non trouvé")
    return laboratoire
  }

  async create(data: any) {
    // Vérifier l'unicité de l'acronyme
    const existing = await prisma.laboratoire.findUnique({
      where: { acronym: data.acronym }
    })
    if (existing) {
      throw new AppError(400, `L'acronyme "${data.acronym}" est déjà utilisé`)
    }

    // Vérifier que l'institution existe
    const institution = await prisma.institution.findUnique({
      where: { id: data.institutionId }
    })
    if (!institution) {
      throw new AppError(404, "Institution non trouvée")
    }

    return prisma.laboratoire.create({
      data: {
        ...data,
        institutionName: institution.name
      },
      include: {
        institution: { select: { acronym: true, name: true } }
      }
    })
  }

  async update(id: string, data: any) {
    const laboratoire = await prisma.laboratoire.findUnique({ where: { id } })
    if (!laboratoire) throw new AppError(404, "Laboratoire non trouvé")

    // Si l'institution change, mettre à jour le nom dénormalisé
    if (data.institutionId) {
      const institution = await prisma.institution.findUnique({
        where: { id: data.institutionId }
      })
      if (institution) {
        data.institutionName = institution.name
      }
    }

    return prisma.laboratoire.update({
      where: { id },
      data,
      include: {
        institution: { select: { acronym: true, name: true } },
        responsable: { select: { id: true, name: true } }
      }
    })
  }

  async delete(id: string) {
    const laboratoire = await prisma.laboratoire.findUnique({
      where: { id },
      include: { _count: { select: { chercheurs: true } } }
    })
    
    if (!laboratoire) throw new AppError(404, "Laboratoire non trouvé")
    
    if (laboratoire._count.chercheurs > 0) {
      throw new AppError(400, 
        `Impossible de supprimer : ${laboratoire._count.chercheurs} chercheur(s) sont rattachés à ce laboratoire`
      )
    }

    return prisma.laboratoire.delete({ where: { id } })
  }

  async getChercheurs(id: string) {
    const laboratoire = await prisma.laboratoire.findUnique({ where: { id } })
    if (!laboratoire) throw new AppError(404, "Laboratoire non trouvé")

    return prisma.chercheur.findMany({
      where: { laboratoireId: id },
      select: {
        id: true, name: true, specialty: true,
        photoUrl: true, email: true, phone: true, faculty: true
      },
      orderBy: { name: "asc" }
    })
  }

  async getPublications(id: string) {
    const laboratoire = await prisma.laboratoire.findUnique({ where: { id } })
    if (!laboratoire) throw new AppError(404, "Laboratoire non trouvé")

    return prisma.publication.findMany({
      where: { laboratoireId: id },
      include: {
        authors: true,
        keywords: true
      },
      orderBy: { year: "desc" }
    })
  }
}