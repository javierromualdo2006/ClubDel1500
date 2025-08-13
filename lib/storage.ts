export class LocalStorage {
  private static prefix = "club_del_1500_"

  static set<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value)
      localStorage.setItem(this.prefix + key, serializedValue)
      console.log(`Datos guardados en localStorage: ${key}`, value)
    } catch (error) {
      console.error("Error guardando en localStorage:", error)
    }
  }

  static get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(this.prefix + key)
      if (item === null) {
        console.log(`No se encontraron datos para ${key}, usando valores por defecto`)
        this.set(key, defaultValue)
        return defaultValue
      }
      const parsedValue = JSON.parse(item) as T
      console.log(`Datos cargados de localStorage: ${key}`, parsedValue)
      return parsedValue
    } catch (error) {
      console.error("Error leyendo de localStorage:", error)
      return defaultValue
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(this.prefix + key)
  }

  static clear(): void {
    const keys = Object.keys(localStorage).filter((key) => key.startsWith(this.prefix))
    keys.forEach((key) => localStorage.removeItem(key))
  }

  static exists(key: string): boolean {
    return localStorage.getItem(this.prefix + key) !== null
  }
}

export class FileStorage {
  private static files: Map<string, { file: File; url: string }> = new Map()

  static async saveFile(file: File): Promise<string> {
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const url = URL.createObjectURL(file)

    this.files.set(fileId, { file, url })

    // Simular subida a servidor
    await new Promise((resolve) => setTimeout(resolve, 500))

    return fileId
  }

  static getFileUrl(fileId: string): string | null {
    const fileData = this.files.get(fileId)
    return fileData ? fileData.url : null
  }

  static getFile(fileId: string): File | null {
    const fileData = this.files.get(fileId)
    return fileData ? fileData.file : null
  }

  static deleteFile(fileId: string): boolean {
    const fileData = this.files.get(fileId)
    if (fileData) {
      URL.revokeObjectURL(fileData.url)
      this.files.delete(fileId)
      return true
    }
    return false
  }

  static getAllFiles(): Array<{ id: string; file: File; url: string }> {
    return Array.from(this.files.entries()).map(([id, data]) => ({
      id,
      file: data.file,
      url: data.url,
    }))
  }
}

// Fixed generic type syntax issues by using proper function declarations
export const storage = {
  set: <T,>(key: string, value: T): void => LocalStorage.set(key, value),

  get: <T,>(key: string, defaultValue?: T): T => LocalStorage.get(key, defaultValue || ([] as any)),

  remove: (key: string): void => LocalStorage.remove(key),

  clear: (): void => LocalStorage.clear(),

  exists: (key: string): boolean => LocalStorage.exists(key),
}
