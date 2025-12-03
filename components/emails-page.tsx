"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, Mail, Users, CheckCircle, AlertCircle, TestTube } from "lucide-react"
import { Footer } from "./footer"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { sendMassEmail, type EmailRecipient } from "@/lib/api/emails"

interface EmailData {
  subject: string
  message: string
}

interface SentEmail {
  id: string
  subject: string
  message: string
  recipientCount: number
  sentAt: Date
  status: "sent" | "failed" | "partial"
  successCount?: number
  failedCount?: number
}

export function EmailsPage() {
  const { currentUser, users, isAdmin } = useAuth()
  const router = useRouter()
  const [emailData, setEmailData] = useState<EmailData>({
    subject: "",
    message: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isTestLoading, setIsTestLoading] = useState(false)
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [includeAdmin, setIncludeAdmin] = useState(false)

  // Corrección: Mover redirecciones a useEffect
  useEffect(() => {
    if (!currentUser) {
      router.push("/login")
      return
    }
    if (!isAdmin()) {
      router.push("/")
      return
    }
  }, [currentUser, isAdmin, router])

  if (!currentUser || !isAdmin()) {
    return null
  }

  // Debug logging to help diagnose user data issues
  console.log('All users:', users);
  
  // Filter users based on admin inclusion
  const allUsers = includeAdmin ? users : users.filter((user) => user.id !== currentUser?.id);
  console.log('Filtered users (allUsers):', allUsers);

  // Filter active users with debug logging
  const activeUsers = allUsers.filter((user) => {
    const isActive = user.isActive === true || user.isActive === undefined; // Handle undefined as active by default
    console.log(`User ${user.email} - isActive: ${isActive}, emailNotifications: ${user.emailNotifications}`);
    return isActive;
  });
  console.log('Active users:', activeUsers);

  // Filter users with email notifications enabled
  const emailEnabledUsers = activeUsers.filter((user) => {
    // Consider emailNotifications as enabled if it's true or undefined (default to true)
    const hasNotifications = user.emailNotifications !== false; // true if undefined or true
    console.log(`User ${user.email} - emailNotifications: ${user.emailNotifications}, hasNotifications: ${hasNotifications}`);
    return hasNotifications;
  });
  console.log('Email enabled users:', emailEnabledUsers);

  const handleSendTestEmail = async () => {
    if (!emailData.subject || !emailData.message) {
      return
    }

    setIsTestLoading(true)
    setShowSuccess(false)
    setShowError(false)

    try {
      const recipients: EmailRecipient[] = [
        {
          email: currentUser.email,
          name: currentUser.name,
        },
      ]

      const result = await sendMassEmail({
        subject: `[PRUEBA] ${emailData.subject}`,
        message: emailData.message,
        recipients,
      })

      if (result.success && result.results) {
        const newEmail: SentEmail = {
          id: Date.now().toString(),
          subject: `[PRUEBA] ${emailData.subject}`,
          message: emailData.message,
          recipientCount: 1,
          sentAt: new Date(),
          status: result.results.failed > 0 ? "failed" : "sent",
          successCount: result.results.successful,
          failedCount: result.results.failed,
        }

        setSentEmails((prev) => [newEmail, ...prev])

        if (result.results.failed > 0) {
          setStatusMessage(`Error al enviar email de prueba a ${currentUser.email}`)
          setShowError(true)
        } else {
          setStatusMessage(`¡Email de prueba enviado exitosamente a ${currentUser.email}!`)
          setShowSuccess(true)
        }
      } else {
        throw new Error(result.error || "Error desconocido al enviar email de prueba")
      }
    } catch (error) {
      console.error("Error sending test email:", error)
      setStatusMessage(
        `Error al enviar email de prueba: ${error instanceof Error ? error.message : "Error desconocido"}`,
      )
      setShowError(true)

      const failedEmail: SentEmail = {
        id: Date.now().toString(),
        subject: `[PRUEBA] ${emailData.subject}`,
        message: emailData.message,
        recipientCount: 1,
        sentAt: new Date(),
        status: "failed",
        successCount: 0,
        failedCount: 1,
      }
      setSentEmails((prev) => [failedEmail, ...prev])
    } finally {
      setIsTestLoading(false)
      setTimeout(() => {
        setShowSuccess(false)
        setShowError(false)
      }, 5000)
    }
  }

  const handleSendEmail = async () => {
    if (!emailData.subject || !emailData.message) {
      return
    }

    setIsLoading(true)
    setShowSuccess(false)
    setShowError(false)

    try {
      const recipients: EmailRecipient[] = emailEnabledUsers.map((user) => ({
        email: user.email,
        name: user.name,
      }))

      const result = await sendMassEmail({
        subject: emailData.subject,
        message: emailData.message,
        recipients,
      })

      if (result.success && result.results) {
        const newEmail: SentEmail = {
          id: Date.now().toString(),
          subject: emailData.subject,
          message: emailData.message,
          recipientCount: result.results.total,
          sentAt: new Date(),
          status: result.results.failed > 0 ? "partial" : "sent",
          successCount: result.results.successful,
          failedCount: result.results.failed,
        }

        setSentEmails((prev) => [newEmail, ...prev])
        setEmailData({ subject: "", message: "" })

        if (result.results.failed > 0) {
          setStatusMessage(`Email enviado a ${result.results.successful} usuarios. ${result.results.failed} fallos.`)
          setShowError(true)
        } else {
          setStatusMessage(`¡Email enviado exitosamente a todos los ${result.results.successful} usuarios!`)
          setShowSuccess(true)
        }
      } else {
        throw new Error(result.error || "Error desconocido al enviar emails")
      }
    } catch (error) {
      console.error("Error sending emails:", error)
      setStatusMessage(`Error al enviar emails: ${error instanceof Error ? error.message : "Error desconocido"}`)
      setShowError(true)

      const failedEmail: SentEmail = {
        id: Date.now().toString(),
        subject: emailData.subject,
        message: emailData.message,
        recipientCount: emailEnabledUsers.length,
        sentAt: new Date(),
        status: "failed",
        successCount: 0,
        failedCount: emailEnabledUsers.length,
      }
      setSentEmails((prev) => [failedEmail, ...prev])
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        setShowSuccess(false)
        setShowError(false)
      }, 5000)
    }
  }

  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="w-full max-w-5xl mx-auto p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[#000000]">Enviar Email Masivo</h1>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <Mail className="w-4 h-4 mr-1" />
              Panel de Administrador
            </Badge>
          </div>

          <div className="space-y-6 pb-8">
            {showSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{statusMessage}</AlertDescription>
              </Alert>
            )}

            {showError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{statusMessage}</AlertDescription>
              </Alert>
            )}

            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-[#004386] flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Destinatarios del Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{allUsers.length}</div>
                    <div className="text-sm text-blue-800">Total de Usuarios</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{activeUsers.length}</div>
                    <div className="text-sm text-green-800">Usuarios Activos</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-yellow-600">{emailEnabledUsers.length}</div>
                    <div className="text-sm text-yellow-800">Con Notificaciones</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-gray-600">
                      {activeUsers.length - emailEnabledUsers.length}
                    </div>
                    <div className="text-sm text-gray-800">Sin Notificaciones</div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeAdmin}
                      onChange={(e) => setIncludeAdmin(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Incluirme en el envío masivo ({currentUser.email})</span>
                  </label>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> El email se enviará únicamente a los {emailEnabledUsers.length} usuarios que
                    han habilitado las notificaciones por email.
                    {activeUsers.length - emailEnabledUsers.length > 0 && (
                      <span className="block mt-1">
                        {activeUsers.length - emailEnabledUsers.length} usuarios activos no recibirán el email porque
                        tienen las notificaciones deshabilitadas.
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-base sm:text-xl text-[#004386] flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Componer Email Masivo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Asunto</Label>
                  <Input
                    id="subject"
                    value={emailData.subject}
                    onChange={(e) => setEmailData((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="Ingresa el asunto del email"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    value={emailData.message}
                    onChange={(e) => setEmailData((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="Escribe tu mensaje aquí..."
                    className="mt-1 min-h-[200px] sm:min-h-[250px]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button
                    onClick={handleSendTestEmail}
                    disabled={!emailData.subject || !emailData.message || isTestLoading || isLoading}
                    variant="outline"
                    className="w-full sm:w-auto border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
                  >
                    {isTestLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Enviando prueba...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Enviar Prueba a Mi Email
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleSendEmail}
                    disabled={
                      !emailData.subject ||
                      !emailData.message ||
                      isLoading ||
                      isTestLoading ||
                      emailEnabledUsers.length === 0
                    }
                    className="bg-[#004386] hover:bg-[#005ea6] w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando a {emailEnabledUsers.length} usuarios...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar a Usuarios con Notificaciones ({emailEnabledUsers.length})
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEmailData({ subject: "", message: "" })}
                    disabled={isLoading || isTestLoading}
                    className="w-full sm:w-auto"
                  >
                    Limpiar
                  </Button>
                </div>

                {emailEnabledUsers.length === 0 && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      No hay usuarios con notificaciones por email habilitadas. El envío masivo está deshabilitado.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {sentEmails.length > 0 && (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg text-[#004386]">
                    Historial de Emails Masivos Enviados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {sentEmails.map((email) => (
                      <div key={email.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                          <h4 className="font-medium text-[#000000] flex-1">{email.subject}</h4>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <Badge
                              variant={
                                email.status === "sent"
                                  ? "default"
                                  : email.status === "partial"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {email.status === "sent" ? "Enviado" : email.status === "partial" ? "Parcial" : "Falló"}
                            </Badge>
                            <span className="text-xs text-gray-500">{email.sentAt.toLocaleString()}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-3">{email.message}</p>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <strong>
                            {email.status === "partial"
                              ? `${email.successCount} exitosos, ${email.failedCount} fallidos de ${email.recipientCount} usuarios`
                              : `Enviado a ${email.recipientCount} usuarios`}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}