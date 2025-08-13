"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Footer } from "./footer"
import { Eye, EyeOff, Lock, User, Mail, UserPlus, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    emailNotifications: false,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { register } = useAuth()

  const validatePassword = (password: string) => {
    const errors = []

    if (password.length < 8) {
      errors.push("mínimo 8 caracteres")
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("al menos 1 letra mayúscula")
    }

    if (!/[0-9]/.test(password)) {
      errors.push("al menos 1 número")
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!formData.username.trim()) {
      setError("El nombre de usuario es obligatorio")
      setIsLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError("El correo electrónico es obligatorio")
      setIsLoading(false)
      return
    }

    if (!formData.password) {
      setError("La contraseña es obligatoria")
      setIsLoading(false)
      return
    }

    if (!formData.confirmPassword) {
      setError("Debes confirmar tu contraseña")
      setIsLoading(false)
      return
    }

    const passwordErrors = validatePassword(formData.password)
    if (passwordErrors.length > 0) {
      setError(`La contraseña debe tener: ${passwordErrors.join(", ")}`)
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    if (!formData.acceptTerms) {
      setError("Debes aceptar los términos y condiciones para continuar")
      setIsLoading(false)
      return
    }

    try {
      const registrationResult = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        emailNotifications: formData.emailNotifications,
      })

      if (registrationResult.success) {
        setSuccess(true)
        setIsLoading(false)

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError(registrationResult.error || "Error al crear la cuenta. Inténtalo de nuevo.")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.")
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-full max-w-md p-4">
            <Card className="shadow-lg w-full">
              <CardContent className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-green-600 mb-2">¡Registro Exitoso!</h2>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Tu cuenta ha sido creada correctamente. Serás redirigido al inicio de sesión.
                </p>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md p-4">
          <Card className="shadow-lg w-full">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-[#004386] rounded-full flex items-center justify-center mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-[#004386]">Crear Cuenta</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Completa el formulario para registrarte en el sistema
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-[#000000]">
                    Nombre de usuario
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Ingresa tu nombre de usuario"
                      className="pl-10"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#000000]">
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Ingresa tu correo electrónico"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#000000]">
                    Contraseña
                  </Label>
                  <p className="text-xs text-gray-500 mb-1">Mínimo 8 caracteres, 1 mayúscula y 1 número</p>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Crea una contraseña"
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#000000]">
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirma tu contraseña"
                      className="pl-10 pr-10"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emailNotifications"
                      checked={formData.emailNotifications}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, emailNotifications: checked as boolean })
                      }
                    />
                    <Label htmlFor="emailNotifications" className="text-sm text-gray-600">
                      Recibir notificaciones por email
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
                    />
                    <Label htmlFor="acceptTerms" className="text-sm text-gray-600">
                      Acepto los{" "}
                      <Link href="#" className="text-[#004386] hover:underline">
                        términos y condiciones
                      </Link>
                    </Label>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#004386] hover:bg-[#005ea6] text-white py-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="/login" className="text-[#004386] hover:text-[#005ea6] font-medium hover:underline">
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
