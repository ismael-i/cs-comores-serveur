import { env } from "./env"

interface EmailData {
  to: string
  subject: string
  template: string
  context: Record<string, any>
}

export async function sendEmail({ to, subject, template, context }: EmailData) {
  // En développement, on log juste les emails
  // if (env.NODE_ENV === "development" || !env.SMTP_HOST) {
  //   console.log("\n📧 ─── EMAIL (DEV) ───")
  //   console.log(`   To: ${to}`)
  //   console.log(`   Subject: ${subject}`)
  //   console.log(`   Template: ${template}`)
  //   console.log(`   Context:`, JSON.stringify(context, null, 2))
  //   console.log("─".repeat(40) + "\n")
  //   return
  // }

  // En production, utiliser nodemailer
  try {
    const nodemailer = require("nodemailer")
    const handlebars = require("handlebars")
    const fs = require("fs")
    const path = require("path")

    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    })

    const templatePath = path.join(__dirname, "../templates/emails", `${template}.hbs`)
    const templateSource = fs.readFileSync(templatePath, "utf-8")
    const compiledTemplate = handlebars.compile(templateSource)
    const html = compiledTemplate(context)

    await transporter.sendMail({
      from: `"Catalogue Scientifique Comores" <${env.SMTP_FROM}>`,
      to,
      subject,
      html
    })

    console.log(`📧 Email envoyé à ${to}`)
  } catch (error) {
    console.error("Erreur envoi email:", error)
  }
}