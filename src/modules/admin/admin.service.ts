import prisma  from "../../config/database"

export class AdminService {
  async getDashboardStats() {
    const [
      totalChercheurs,
      totalLaboratoires,
      totalInstitutions,
      totalPublications,
      totalArticles,
      pendingRegistrations,
      usersByRole
    ] = await Promise.all([
      prisma.chercheur.count(),
      prisma.laboratoire.count(),
      prisma.institution.count(),
      prisma.publication.count(),
      prisma.article.count(),
      prisma.user.count({ where: { status: "PENDING" } }),
      prisma.user.groupBy({
        by: ["role"],
        _count: true
      })
    ])

    // Répartition par catégorie de labo
    const labosByCategory = await prisma.laboratoire.groupBy({
      by: ["categorie"],
      _count: true
    })

    // Répartition par domaine de publication
    const pubsByDomain = await prisma.publication.groupBy({
      by: ["domain"],
      _count: true
    })

    return {
      totals: {
        chercheurs: totalChercheurs,
        laboratoires: totalLaboratoires,
        institutions: totalInstitutions,
        publications: totalPublications,
        articles: totalArticles,
        pendingRegistrations
      },
      usersByRole: usersByRole.map(u  => ({
        role: u.role,
        count: u._count
      })),
      labosByCategory: labosByCategory.map(l => ({
        category: l.categorie,
        count: l._count
      })),
      pubsByDomain: pubsByDomain.map(p => ({
        domain: p.domain,
        count: p._count
      }))
    }
  }

  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        chercheurId: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    })
  }
}