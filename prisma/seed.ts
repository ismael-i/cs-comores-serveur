// import { PrismaClient, LabCategory, PublicationDomain, PublicationType } from "@prisma/client"
import bcrypt from "bcryptjs"
import prisma from "../src/config/database"

async function main() {
  console.log("🌱 Début du seed...\n")

  // ─── Nettoyage (optionnel, commenter en production) ───
  await prisma.articleTag.deleteMany()
  await prisma.article.deleteMany()
  await prisma.publicationKeyword.deleteMany()
  await prisma.publicationAuthor.deleteMany()
  await prisma.publication.deleteMany()
  await prisma.adminAction.deleteMany()
  await prisma.user.deleteMany()
  await prisma.chercheur.deleteMany()
  await prisma.laboratoire.deleteMany()
  await prisma.institution.deleteMany()

  console.log("🧹 Base nettoyée\n")

  // ─── ADMIN ────────────────────────────
  const adminPassword = await bcrypt.hash("Admin123!", 12)
  const admin = await prisma.user.create({
    data: {
      email: "ismaelrazafindramboly@gmail.com",
      password: adminPassword,
      name: "Administrateur",
      role: "ADMIN",
      status: "ACTIVE"
    }
  })
  console.log("✅ Admin créé:", admin.email, "/ Admin123!")

  // ─── INSTITUTIONS ─────────────────────
  const udc = await prisma.institution.create({
    data: {
      acronym: "UDC",
      name: "Université des Comores",
      description:
        "Université publique des Comores, principale institution d'enseignement supérieur du pays.",
      logoBg: "bg-blue-100"
    }
  })

  const cndrs = await prisma.institution.create({
    data: {
      acronym: "CNDRS",
      name: "Centre National de Documentation et de Recherche Scientifique",
      description:
        "Centre de recherche national comorien dédié à la documentation et à la recherche scientifique.",
      logoBg: "bg-green-100"
    }
  })

  const inrape = await prisma.institution.create({
    data: {
      acronym: "INRAPE",
      name: "Institut National de Recherche pour l'Agriculture, la Pêche et l'Environnement",
      description:
        "Institut de recherche appliquée dans les domaines de l'agriculture, la pêche et l'environnement.",
      logoBg: "bg-emerald-100"
    }
  })
  console.log("✅ 3 institutions créées")

  // ─── LABORATOIRES ─────────────────────
  const lsml = await prisma.laboratoire.create({
    data: {
      acronym: "LSML",
      name: "Laboratoire des Sciences Mathématiques et leurs Applications",
      description:
        "Laboratoire dédié aux mathématiques fondamentales et appliquées, statistiques et modélisation.",
      categorie: "Sciences",
      researchers: 8,
      institutionId: udc.id,
      institutionName: "UDC",
      thematiques: ["Mathématiques", "Statistiques", "Modélisation"],
      partenariats: ["Université de La Réunion", "AUF"],
      contactEmail: "lsml@univ-comores.km",
      statut: "Actif"
    }
  })

  const biosan = await prisma.laboratoire.create({
    data: {
      acronym: "BioSan",
      name: "Laboratoire Biodiversité et Santé",
      description:
        "Étude de la biodiversité comorienne et son lien avec la santé publique.",
      categorie: "Santé",
      researchers: 6,
      institutionId: udc.id,
      institutionName: "UDC",
      thematiques: ["Biodiversité", "Santé publique", "Épidémiologie"],
      partenariats: ["OMS", "IRD"],
      statut: "Actif"
    }
  })

  const lema = await prisma.laboratoire.create({
    data: {
      acronym: "LEMA",
      name: "Laboratoire d'Économie et Management Appliqué",
      description:
        "Recherches en économie du développement, management et entrepreneuriat.",
      categorie: "Économie",
      researchers: 5,
      institutionId: udc.id,
      institutionName: "UDC",
      thematiques: ["Économie", "Management", "Entrepreneuriat"],
      partenariats: ["Banque Mondiale", "AFD"],
      statut: "Actif"
    }
  })
  console.log("✅ 3 laboratoires créés")

  // ─── CHERCHEURS ───────────────────────
  const nadjim = await prisma.chercheur.create({
    data: {
      name: "Dr Nadjim Ahmed Mohamed",
      specialty: "Mathématiques appliquées, Analyse numérique",
      faculty: "FST",
      email: "ahmed.nadjim@fst-udc.org",
      phone: "+269-341 62 48",
      institutionId: udc.id,
      institutionName: "UDC",
      laboratoireId: lsml.id,
      laboratoireName: "LSML",
      effectif: 8
    }
  })

  const said = await prisma.chercheur.create({
    data: {
      name: "Dr Said Hassani Mohamed",
      specialty: "Biodiversité, Écologie marine",
      faculty: "FST",
      email: "mohamed.saidhassani@univ-comores.com",
      phone: "3330787",
      institutionId: udc.id,
      institutionName: "UDC",
      laboratoireId: biosan.id,
      laboratoireName: "BioSan",
      effectif: 6
    }
  })

  const malik = await prisma.chercheur.create({
    data: {
      name: "Dr Malik El-Houyoun Ahamada",
      specialty: "Économie du développement",
      faculty: "FSJPEG",
      email: "elhouyoun@gmail.com",
      phone: "3634730",
      institutionId: udc.id,
      institutionName: "UDC",
      laboratoireId: lema.id,
      laboratoireName: "LEMA",
      effectif: 5
    }
  })

  // Définir les responsables de labo
  await prisma.laboratoire.update({
    where: { id: lsml.id },
    data: { responsableId: nadjim.id }
  })
  await prisma.laboratoire.update({
    where: { id: biosan.id },
    data: { responsableId: said.id }
  })
  console.log("✅ 3 chercheurs créés avec responsables assignés")

  // ─── CRÉER UN COMPTE CHERCHEUR LIÉ ────
  // (optionnel, pour tester la connexion d'un chercheur)
  const chercheurUser = await prisma.user.create({
    data: {
      email: "chercheur@gmail.com",
      password: adminPassword,
      name: "Dr Nadjim Ahmed Mohamed",
      role: "CHERCHEUR",
      status: "ACTIVE",
      chercheurId: nadjim.id   // liaison
    }
  })
  console.log("✅ Compte chercheur créé:", chercheurUser.email)

  // ─── PUBLICATIONS (avec auteurs liés aux chercheurs) ──
  await prisma.publication.create({
    data: {
      title:
        "Impact du changement climatique sur la biodiversité marine des Comores",
      domain: "Environnement",
      year: 2024,
      type: "Article_Scientifique",
      journal: "Journal of Marine Science",
      description:
        "Étude sur l'impact du réchauffement des océans sur les récifs coralliens comoriens.",
      laboratoireId: biosan.id,
      institutionAcronym: "UDC",
      authors: {
        create: [
          { chercheurId: said.id, order: 0 },
          // On peut ajouter d'autres chercheurs existants ; ici on simule un deuxième auteur fictif, mais comme on n'a que trois chercheurs, prenons le chercheur nadjim pour l'exemple
          { chercheurId: nadjim.id, order: 1 }
        ]
      },
      keywords: {
        create: [
          { keyword: "changement climatique" },
          { keyword: "biodiversité marine" },
          { keyword: "récifs coralliens" }
        ]
      }
    }
  })

  await prisma.publication.create({
    data: {
      title:
        "Modélisation mathématique des systèmes dynamiques appliquée à l'économie comorienne",
      domain: "Sciences",
      year: 2024,
      type: "Article_Scientifique",
      journal: "Applied Mathematics Journal",
      description:
        "Application des modèles mathématiques pour analyser la croissance économique.",
      laboratoireId: lsml.id,
      institutionAcronym: "UDC",
      authors: {
        create: [
          { chercheurId: nadjim.id, order: 0 }
        ]
      },
      keywords: {
        create: [
          { keyword: "modélisation mathématique" },
          { keyword: "systèmes dynamiques" },
          { keyword: "économie" }
        ]
      }
    }
  })
  console.log("✅ 2 publications créées")

  // ─── ARTICLES (avec auteur chercheur et laboratoire) ──
  await prisma.article.create({
    data: {
      date: new Date("2025-03-15"),
      title: "Nouvelle publication sur la biodiversité marine",
      description:
        "Une étude majeure sur l'impact du changement climatique sur les récifs coralliens comoriens.",
      body: [
        "Une équipe de chercheurs du laboratoire BioSan a publié une étude révolutionnaire sur l'impact du changement climatique.",
        "Cette recherche met en lumière l'importance de la préservation des écosystèmes marins dans l'archipel des Comores.",
        "Les résultats seront présentés lors de la prochaine conférence internationale sur la biodiversité."
      ],
      chercheurId: said.id,            // auteur
      laboratoireId: biosan.id,        // laboratoire
      tags: {
        create: [
          { tag: "biodiversité" },
          { tag: "recherche" },
          { tag: "environnement" }
        ]
      }
    }
  })

  await prisma.article.create({
    data: {
      date: new Date("2025-02-28"),
      title: "Conférence sur l'entrepreneuriat aux Comores",
      description:
        "Le LEMA organise une conférence sur les défis de l'entrepreneuriat dans l'archipel.",
      body: [
        "Le Laboratoire d'Économie et Management Appliqué a organisé une conférence sur l'entrepreneuriat.",
        "Plusieurs intervenants ont partagé leurs expériences sur l'entrepreneuriat local et les défis spécifiques aux Comores."
      ],
      chercheurId: malik.id,           // auteur
      laboratoireId: lema.id,          // laboratoire
      tags: {
        create: [
          { tag: "entrepreneuriat" },
          { tag: "économie" },
          { tag: "conférence" }
        ]
      }
    }
  })
  console.log("✅ 2 articles créés")

  console.log("\n🎉 ──────────────────────────────")
  console.log("   Seed terminé avec succès !")
  console.log("──────────────────────────────────")
  console.log("\n📧 Comptes de test :")
  console.log("   Admin  : ismaelrazafindramboly@gmail.com / Admin123!")
  console.log("   Chercheur (lié) : chercheur@gmail.com / Admin123!")
  console.log("   Chercheur 1 : ahmed.nadjim@fst-udc.org")
  console.log("   Chercheur 2 : mohamed.saidhassani@univ-comores.com\n")
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })