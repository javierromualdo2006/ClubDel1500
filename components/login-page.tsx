"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Footer } from "./footer"
import { Eye, EyeOff, Lock, User, Copy } from "lucide-react"
import { useAuth } from "@/contexts/auth-context" // Cambiado a contexts
import { useRouter } from "next/navigation"
import Link from "next/link"

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showDemoAccount, setShowDemoAccount] = useState(false)
  const [copiedField, setCopiedField] = useState("")

  const { login, currentUser } = useAuth()
  const router = useRouter()

  // Cuenta de administrador de prueba
  const demoAccount = {
    username: "admin@test.com",
    password: "admin123"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(formData.username, formData.password)
      if (success) {
        router.push("/")
      } else {
        setError("Usuario o contraseña incorrectos")
      }
    } catch (err) {
      setError("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoAccount = () => {
    setFormData({
      username: demoAccount.username,
      password: demoAccount.password
    })
    setShowDemoAccount(false)
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(""), 2000)
  }

  // Si ya está logueado, redirigir
  if (currentUser) {
    router.push("/")
    return null
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl w-full border-0">
            <CardHeader className="text-center pb-6 space-y-4">
              <div className="mx-auto w-16 h-16 bg-[#004386] rounded-full flex items-center justify-center mb-2">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-[#004386]">Iniciar Sesión</CardTitle>
                <CardDescription className="text-sm sm:text-base mt-2">
                  Ingresa tus credenciales para acceder al sistema
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-blue-800">Cuenta de demostración</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowDemoAccount(!showDemoAccount)}
                    className="h-7 text-xs"
                  >
                    {showDemoAccount ? "Ocultar" : "Mostrar"}
                  </Button>
                </div>
                
                {showDemoAccount && (
                  <div className="space-y-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Usuario:</span>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-blue-100 px-2 py-1 rounded">{demoAccount.username}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(demoAccount.username, "username")}
                        >
                          <Copy className="h-3 w-3" />
                          {copiedField === "username" && (
                            <span className="absolute -top-6 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              ¡Copiado!
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Contraseña:</span>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-blue-100 px-2 py-1 rounded">{demoAccount.password}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(demoAccount.password, "password")}
                        >
                          <Copy className="h-3 w-3" />
                          {copiedField === "password" && (
                            <span className="absolute -top-6 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              ¡Copiado!
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={fillDemoAccount}
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      Usar esta cuenta
                    </Button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-[#000000]">
                    Usuario
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Ingresa tu usuario"
                      className="pl-10"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-[#000000]">
                      Contraseña
                    </Label>
                    <Link 
                      href="/recuperar-contrasena" 
                      className="text-xs text-[#004386] hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu contraseña"
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

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#004386] hover:bg-[#005ea6] text-white py-2 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  ¿No tienes una cuenta?{" "}
                  <Link href="/registro" className="text-[#004386] hover:text-[#005ea6] font-medium hover:underline">
                    Regístrate aquí
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