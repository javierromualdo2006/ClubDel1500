import { LocalStorage } from "../storage"

export interface User {
  id: string
  username: string
  email: string
  role: "admin" | "user"
  isActive: boolean
  emailNotifications: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  emailNotifications: boolean
}

export class UsersAPI {
  private static STORAGE_KEY = "users"
  private static CURRENT_USER_KEY = "current_user"

  static async getAll(): Promise<User[]> {
    return LocalStorage.get<User[]>(this.STORAGE_KEY, this.getDefaultUsers())
  }

  static async getById(id: string): Promise<User | null> {
    const users = await this.getAll()
    return users.find((u) => u.id === id) || null
  }

  static async getCurrentUser(): Promise<User | null> {
    return LocalStorage.get<User | null>(this.CURRENT_USER_KEY, null)
  }

  static async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    const users = await this.getAll()

    // Validación específica para admin
    if (credentials.username === "admin" && credentials.password === "123") {
      const adminUser = users.find((u) => u.username === "admin")
      if (adminUser && adminUser.isActive) {
        const updatedUser = { ...adminUser, lastLogin: new Date().toISOString() }
        await this.updateUser(adminUser.id, { lastLogin: updatedUser.lastLogin })
        LocalStorage.set(this.CURRENT_USER_KEY, updatedUser)
        return { success: true, user: updatedUser }
      }
    }

    // Para otros usuarios, cualquier contraseña funciona (excepto admin)
    const user = users.find((u) => u.username === credentials.username && u.isActive && u.username !== "admin")

    if (user) {
      const updatedUser = { ...user, lastLogin: new Date().toISOString() }
      await this.updateUser(user.id, { lastLogin: updatedUser.lastLogin })
      LocalStorage.set(this.CURRENT_USER_KEY, updatedUser)
      return { success: true, user: updatedUser }
    }

    return { success: false, error: "Credenciales inválidas" }
  }

  static async logout(): Promise<void> {
    LocalStorage.remove(this.CURRENT_USER_KEY)
  }

  static async register(userData: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> {
    const users = await this.getAll()

    const existingUsername = users.find((u) => u.username.toLowerCase() === userData.username.toLowerCase())
    const existingEmail = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase())

    if (existingUsername && existingEmail) {
      return { success: false, error: "El nombre de usuario y el email ya están en uso" }
    }

    if (existingUsername) {
      return { success: false, error: "El nombre de usuario ya está en uso" }
    }

    if (existingEmail) {
      return { success: false, error: "El email ya está registrado" }
    }

    const newUser: User = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      role: "user",
      isActive: true,
      emailNotifications: userData.emailNotifications,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    users.push(newUser)
    LocalStorage.set(this.STORAGE_KEY, users)

    return { success: true, user: newUser }
  }

  static async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    const users = await this.getAll()
    const index = users.findIndex((u) => u.id === id)

    if (index === -1) return null

    const updatedUser: User = {
      ...users[index],
      ...userData,
      updatedAt: new Date().toISOString(),
    }

    users[index] = updatedUser
    LocalStorage.set(this.STORAGE_KEY, users)

    // Actualizar usuario actual si es el mismo
    const currentUser = await this.getCurrentUser()
    if (currentUser && currentUser.id === id) {
      LocalStorage.set(this.CURRENT_USER_KEY, updatedUser)
    }

    return updatedUser
  }

  static async updateUserRole(id: string, role: "admin" | "user"): Promise<boolean> {
    const result = await this.updateUser(id, { role })
    return result !== null
  }

  static async toggleUserStatus(id: string): Promise<boolean> {
    const user = await this.getById(id)
    if (!user) return false

    const result = await this.updateUser(id, { isActive: !user.isActive })
    return result !== null
  }

  private static getDefaultUsers(): User[] {
    return [
      {
        id: "1",
        username: "admin",
        email: "admin@sistema.com",
        role: "admin",
        isActive: true,
        emailNotifications: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "2",
        username: "usuario",
        email: "usuario@sistema.com",
        role: "user",
        isActive: true,
        emailNotifications: false,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "3",
        username: "juan",
        email: "juan@sistema.com",
        role: "user",
        isActive: true,
        emailNotifications: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "4",
        username: "maria",
        email: "maria@sistema.com",
        role: "user",
        isActive: false,
        emailNotifications: false,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ]
  }
}
