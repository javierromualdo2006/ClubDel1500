// components/register-page.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Footer } from "./footer";
import { Eye, EyeOff, Lock, User, Mail, UserPlus, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/auth-context";
import Link from "next/link";

export function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmPassword: "", acceptTerms: false, emailNotifications: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Todos los campos son obligatorios");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      setError("Debes aceptar los términos y condiciones");
      setIsLoading(false);
      return;
    }

    const result = await register({ username: formData.username, email: formData.email, password: formData.password, emailNotifications: formData.emailNotifications });

    if (result) {
      setSuccess(true);
      setIsLoading(false);
      setTimeout(() => router.push("/login"), 2000);
    } else {
      setError("Error al registrar usuario");
      setIsLoading(false);
    }
  };

  if (success) return (
    <>
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-green-600 mb-2">¡Registro Exitoso!</h2>
            <p className="text-gray-600 mb-4">Tu cuenta ha sido creada correctamente. Serás redirigido al inicio de sesión.</p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );

  return (
    <>
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-lg p-4">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-[#004386] rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-[#004386]">Crear Cuenta</CardTitle>
            <CardDescription className="text-sm text-gray-600">Completa el formulario para registrarte</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="username" type="text" className="pl-10" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="email" type="email" className="pl-10" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="password" type={showPassword ? "text" : "password"} className="pl-10 pr-10" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} className="pl-10 pr-10" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} required />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox checked={formData.emailNotifications} onCheckedChange={checked => setFormData({ ...formData, emailNotifications: checked as boolean })} />
                <Label>Recibir notificaciones por email</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox checked={formData.acceptTerms} onCheckedChange={checked => setFormData({ ...formData, acceptTerms: checked as boolean })} />
                <Label>Acepto los <Link href="#" className="text-[#004386] hover:underline">términos y condiciones</Link></Label>
              </div>

              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

              <Button type="submit" className="w-full bg-[#004386] hover:bg-[#005ea6] text-white py-2" disabled={isLoading}>
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              ¿Ya tienes una cuenta? <Link href="/login" className="text-[#004386] hover:text-[#005ea6] font-medium hover:underline">Inicia sesión aquí</Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
