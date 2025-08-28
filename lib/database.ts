// dashboard.ts
import PocketBase from "pocketbase"

/* -------------------- Configuración y Singleton PocketBase -------------------- */
export interface DatabaseConfig {
  url: string
  adminEmail?: string
  adminPassword?: string
}

class DatabaseManager {
  private static instance: DatabaseManager
  private client: PocketBase | null = null

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  async connect(config: DatabaseConfig): Promise<boolean> {
    try {
      console.log("Conectando a PocketBase en", config.url)
      this.client = new PocketBase(config.url)

      if (config.adminEmail && config.adminPassword) {
        await this.client.admins.authWithPassword(
          config.adminEmail,
          config.adminPassword
        )
        console.log("Autenticado como admin")
      }

      console.log("Conexión establecida con PocketBase")
      return true
    } catch (error) {
      console.error("Error conectando a PocketBase:", error)
      return false
    }
  }

  disconnect(): void {
    this.client = null
    console.log("Desconectado de PocketBase")
  }

  isConnectionActive(): boolean {
    return this.client !== null
  }

  getClient(): PocketBase {
    if (!this.client) {
      throw new Error(
        "No hay conexión activa con PocketBase. Llama a connect() primero."
      )
    }
    return this.client
  }
}

// Singleton global
export const db = DatabaseManager.getInstance()
export const getPB = () => db.getClient() // acceso seguro al cliente

/* -------------------- Tipos y API de Usuarios -------------------- */
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
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  emailNotifications: boolean
}

export class UsersAPI {
  private static get client() {
    return getPB()
  }

  private static mapRecordToUser(record: any): User {
    return {
      id: record.id,
      username: record.username,
      email: record.email,
      role: record.role,
      isActive: record.isActive,
      emailNotifications: record.emailNotifications,
      createdAt: record.created,
      updatedAt: record.updated,
      lastLogin: record.lastLogin ?? undefined,
    }
  }

  static async getAll(): Promise<User[]> {
    const records = await this.client.collection("users").getFullList()
    return records.map(this.mapRecordToUser)
  }

  static async getById(id: string): Promise<User | null> {
    try {
      const record = await this.client.collection("users").getOne(id)
      return this.mapRecordToUser(record)
    } catch {
      return null
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    const model = this.client.authStore.model
    return model ? this.mapRecordToUser(model) : null
  }

  static async login(
    credentials: LoginCredentials
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const authData = await this.client
        .collection("users")
        .authWithPassword(credentials.email, credentials.password)

      await this.client.collection("users").update(authData.record.id, {
        lastLogin: new Date().toISOString(),
      })

      return { success: true, user: this.mapRecordToUser(authData.record) }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  static async logout(): Promise<void> {
    this.client.authStore.clear()
  }

  static async register(
    userData: RegisterData
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const newUserRecord = await this.client.collection("users").create({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        passwordConfirm: userData.password,
        role: "user",
        isActive: true,
        emailNotifications: userData.emailNotifications,
      })
      return { success: true, user: this.mapRecordToUser(newUserRecord) }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  static async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    try {
      const updatedRecord = await this.client.collection("users").update(id, {
        ...userData,
        updated: new Date().toISOString(),
      })
      return this.mapRecordToUser(updatedRecord)
    } catch {
      return null
    }
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
}

/* -------------------- Dashboard de ejemplo -------------------- */
async function dashboard() {
  // 1️⃣ Conectamos a PocketBase
  const connected = await db.connect({
    url: "http://127.0.0.1:8090",
    adminEmail: "admin@correo.com",
    adminPassword: "tuPassword",
  })

  if (!connected) {
    console.error("No se pudo conectar a PocketBase")
    return
  }

  // 2️⃣ Obtenemos todos los usuarios
  const users = await UsersAPI.getAll()
  console.log("Usuarios registrados:")
  users.forEach((user) => {
    console.log(
      `- ${user.username} (${user.email}) | Rol: ${user.role} | Activo: ${user.isActive}`
    )
  })
}

// Ejecutamos el dashboard
dashboard()
