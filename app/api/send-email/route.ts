import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  try {
    // Debug environment variables
    console.log("Environment debug:", {
      hasResendKey: !!process.env.RESEND_API_KEY,
      keyLength: process.env.RESEND_API_KEY?.length || 0,
      keyPrefix: process.env.RESEND_API_KEY?.substring(0, 8) || "none",
      allEnvKeys: Object.keys(process.env).filter((key) => key.includes("RESEND")),
    })

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY environment variable is not set")
      return NextResponse.json(
        {
          error: "Email service not configured. Please add RESEND_API_KEY environment variable.",
          debug: {
            availableEnvVars: Object.keys(process.env).filter((key) => key.includes("RESEND")),
            message: "Make sure RESEND_API_KEY is set in your Vercel project settings",
          },
        },
        { status: 500 },
      )
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const { subject, message, recipients } = await request.json()

    if (!subject || !message || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: "Subject, message, and recipients are required" }, { status: 400 })
    }

    console.log(`Attempting to send emails to ${recipients.length} recipients`)

    const emailPromises = recipients.map(async (recipient: { email: string; name: string }) => {
      try {
        const data = await resend.emails.send({
          from: "Club del 1500 <onboarding@resend.dev>",
          to: [recipient.email],
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #004386; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">Club del 1500</h1>
              </div>
              <div style="padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #004386; margin-top: 0;">Hola ${recipient.name},</h2>
                <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  ${message.replace(/\n/g, "<br>")}
                </div>
              </div>
              <div style="background-color: #004386; color: white; padding: 15px; text-align: center; font-size: 14px;">
                <p style="margin: 0;">© 2024 Club del 1500. Todos los derechos reservados.</p>
              </div>
            </div>
          `,
        })

        console.log(`Email sent successfully to ${recipient.email}`)
        return { success: true, recipient: recipient.email, data }
      } catch (error) {
        console.error(`Error sending email to ${recipient.email}:`, error)
        return {
          success: false,
          recipient: recipient.email,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    })

    const results = await Promise.all(emailPromises)
    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    console.log(`Email sending completed: ${successful} successful, ${failed} failed`)

    return NextResponse.json({
      success: true,
      message: `Emails sent successfully to ${successful} recipients${failed > 0 ? `, ${failed} failed` : ""}`,
      results: {
        successful,
        failed,
        total: recipients.length,
        details: results,
      },
    })
  } catch (error) {
    console.error("Error in send-email API:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)

    return NextResponse.json(
      {
        error: "Failed to send emails",
        details: errorMessage,
        debug: {
          hasApiKey: !!process.env.RESEND_API_KEY,
          apiKeyLength: process.env.RESEND_API_KEY?.length || 0,
          availableEnvVars: Object.keys(process.env).filter((key) => key.includes("RESEND")),
        },
      },
      { status: 500 },
    )
  }
}
