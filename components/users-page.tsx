"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ShieldCheck, User, Mail } from "lucide-react"
import { Footer } from "./footer"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function UsersPage() {
  const { currentUser, users, updateUserRole, toggleUserStatus, isAdmin } = useAuth()
  const router = useRouter()

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

  const handleRoleChange = (userId: string, currentRole: "admin" | "user") => {
    const newRole = currentRole === "admin" ? "user" : "admin"
    updateUserRole(userId, newRole)
  }

  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[#000000]">Gestión de Usuarios</h1>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Panel de Administrador
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
            {users.map((user) => (
              <Card
                key={user.id}
                className={`w-full ${
                  user.isActive ? "bg-white" : "bg-gray-100"
                } border-2 ${user.role === "admin" ? "border-yellow-200" : "border-gray-200"}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg text-[#000000] flex items-center gap-2 min-w-0">
                      {user.role === "admin" ? (
                        <ShieldCheck className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      ) : (
                        <User className="w-5 h-5 text-gray-600 flex-shrink-0" />
                      )}
                      <span className="truncate">{user.username}</span>
                    </CardTitle>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"} className="flex-shrink-0">
                      {user.role === "admin" ? "Admin" : "Usuario"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span>Estado:</span>
                      <Badge variant={user.isActive ? "default" : "destructive"}>
                        {user.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>

                  {user.id !== currentUser.id && (
                    <div className="space-y-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Permisos de Admin</span>
                        <Switch
                          checked={user.role === "admin"}
                          onCheckedChange={() => handleRoleChange(user.id, user.role)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Usuario Activo</span>
                        <Switch checked={user.isActive} onCheckedChange={() => toggleUserStatus(user.id)} />
                      </div>
                    </div>
                  )}

                  {user.id === currentUser.id && (
                    <div className="pt-3 border-t">
                      <Badge variant="outline" className="w-full justify-center">
                        Tu cuenta actual
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
