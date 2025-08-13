"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { UsersAPI, type RegisterData } from "@/lib/api/users"

interface AuthContextType {
  currentUser: any | null
  users: any[]
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  register: (userData: RegisterData) => Promise<boolean>
  updateUserRole: (userId: string, role: "admin" | "user") => Promise<void>
  toggleUserStatus: (userId: string) => Promise<void>
  isAdmin: () => boolean
  loading: boolean
  refreshUsers: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Cargar usuario actual
        const user = await UsersAPI.getCurrentUser()
        setCurrentUser(user)

        // Cargar todos los usuarios
        const allUsers = await UsersAPI.getAll()
        setUsers(allUsers)
      } catch (error) {
        console.error("Error inicializando autenticación:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await UsersAPI.login({ username, password })
      if (result.success && result.user) {
        setCurrentUser(result.user)
        await refreshUsers()
        return true
      }
      return false
    } catch (error) {
      console.error("Error en login:", error)
      return false
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const result = await UsersAPI.register(userData)
      if (result.success) {
        await refreshUsers()
        return true
      }
      return false
    } catch (error) {
      console.error("Error en registro:", error)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await UsersAPI.logout()
      setCurrentUser(null)
    } catch (error) {
      console.error("Error en logout:", error)
    }
  }

  const updateUserRole = async (userId: string, role: "admin" | "user"): Promise<void> => {
    try {
      await UsersAPI.updateUserRole(userId, role)
      await refreshUsers()
    } catch (error) {
      console.error("Error actualizando rol:", error)
    }
  }

  const toggleUserStatus = async (userId: string): Promise<void> => {
    try {
      await UsersAPI.toggleUserStatus(userId)
      await refreshUsers()
    } catch (error) {
      console.error("Error cambiando estado:", error)
    }
  }

  const refreshUsers = async (): Promise<void> => {
    try {
      const allUsers = await UsersAPI.getAll()
      setUsers(allUsers)
    } catch (error) {
      console.error("Error refrescando usuarios:", error)
    }
  }

  const isAdmin = (): boolean => {
    return currentUser?.role === "admin"
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        register,
        updateUserRole,
        toggleUserStatus,
        isAdmin,
        loading,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
