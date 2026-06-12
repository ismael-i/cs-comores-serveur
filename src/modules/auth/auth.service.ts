import prisma  from "../../config/database"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { generateToken } from "../../shared/utils/jwt"
import { LoginInput, RegisterInput } from "./auth.schema"
import { AppError } from "../../shared/errors/AppError"
import { env } from "../../config/env"
import { sendEmail } from "../../config/email"

export class AuthService {
  
  async login({ email, password }: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email } })
    
    if (!user) {
      throw new AppError(401, "Email ou mot de passe incorrect")
    }

    // Vérifier le statut
    const statusMessages: Record<string, string> = {
      PENDING: "Votre compte est en attente de validation par l'administration",
      VALIDATED: "Veuillez activer votre compte en cliquant sur le lien reçu par email",
      REJECTED: user.adminRejectionReason 
        ? `Votre inscription a été refusée : ${user.adminRejectionReason}`
        : "Votre inscription a été refusée par l'administration"
    }

    if (user.status !== "ACTIVE") {
      throw new AppError(403, statusMessages[user.status] || "Compte non actif")
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      throw new AppError(401, "Email ou mot de passe incorrect")
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      chercheurId: user.chercheurId || undefined
    })

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        chercheurId: user.chercheurId
      }
    }
  }

  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({ 
      where: { email: data.email } 
    })

    if (existingUser) {
      throw new AppError(400, "Cet email est déjà utilisé")
    }

    if (data.chercheurId) {
      const chercheur = await prisma.chercheur.findUnique({
        where: { id: data.chercheurId }
      })
      
      if (!chercheur) {
        throw new AppError(404, "Chercheur non trouvé")
      }
      if (chercheur.userId) {
        throw new AppError(400, "Ce chercheur a déjà un compte")
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: "CHERCHEUR",
        status: "PENDING",
        chercheurId: data.chercheurId
      }
    })

    // Notifier les admins
    // const admins = await prisma.user.findMany({
    //   where: { role: "ADMIN", status: "ACTIVE" }
    // })

    // for (const admin of admins) {
    //   await sendEmail({
    //     to: admin.email,
    //     subject: "🔔 Nouvelle demande d'inscription chercheur",
    //     template: "admin-notification",
    //     context: {
    //       chercheurName: data.name,
    //       chercheurEmail: data.email,
    //       adminUrl: env.FRONTEND_URL
    //     }
    //   })
    // }

    return {
      message: "Demande envoyée. Vous recevrez un email après validation.",
      status: "PENDING"
    }
  }

  async validateRegistration(userId: string, adminId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    
    if (!user) throw new AppError(404, "Utilisateur non trouvé")
    if (user.status !== "PENDING") {
      throw new AppError(400, `Cette demande est déjà ${user.status}`)
    }

    const validationToken = crypto.randomBytes(32).toString("hex")
    const validationTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: userId },
      data: {
        status: "VALIDATED",
        validationToken,
        validationTokenExpiry
      }
    })

    await prisma.adminAction.create({
      data: { action: "VALIDATED", adminId, userId }
    })

    const activationUrl = `${env.FRONTEND_URL}/auth/activate?token=${validationToken}`

    await sendEmail({
      to: user.email,
      subject: "✅ Votre inscription a été validée",
      template: "chercheur-validation",
      context: {
        chercheurName: user.name,
        activationUrl
      }
    })

    return { message: "Compte validé. Email d'activation envoyé au chercheur." }
  }

  async rejectRegistration(userId: string, adminId: string, reason: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    
    if (!user) throw new AppError(404, "Utilisateur non trouvé")
    if (user.status !== "PENDING") {
      throw new AppError(400, `Cette demande est déjà ${user.status}`)
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        status: "REJECTED",
        adminRejectionReason: reason
      }
    })

    await prisma.adminAction.create({
      data: { action: "REJECTED", reason, adminId, userId }
    })

    await sendEmail({
      to: user.email,
      subject: "❌ Demande d'inscription non retenue",
      template: "chercheur-rejected",
      context: {
        chercheurName: user.name,
        reason,
        contactEmail: env.CONTACT_EMAIL
      }
    })

    return { message: "Demande rejetée. Le chercheur a été notifié." }
  }

  async activateAccount(token: string) {
    const user = await prisma.user.findFirst({
      where: { validationToken: token, status: "VALIDATED" }
    })

    if (!user) throw new AppError(400, "Lien d'activation invalide")
    
    if (user.validationTokenExpiry && user.validationTokenExpiry < new Date()) {
      throw new AppError(400, "Le lien a expiré. Contactez l'administration.")
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: "ACTIVE",
        validationToken: null,
        validationTokenExpiry: null
      }
    })

    return { message: "Compte activé avec succès ! Vous pouvez vous connecter." }
  }

  async getPendingRegistrations() {
    return prisma.user.findMany({
      where: { status: "PENDING" },
      select: {
        id: true,
        email: true,
        name: true,
        chercheurId: true,
        createdAt: true,
        chercheur: {
          select: {
            specialty: true,
            institution: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        chercheur: {
          include: {
            institution: true,
            laboratoire: true
          }
        }
      }
    })

    if (!user) throw new AppError(404, "Utilisateur non trouvé")
    
    const { password, ...profile } = user
    return profile
  }
}