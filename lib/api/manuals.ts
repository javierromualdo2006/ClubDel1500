import { LocalStorage, FileStorage } from "../storage"

export interface Manual {
  id: string
  title: string
  brand: string
  model: string
  year: string
  fileSize: string
  fileName: string
  fileType: string
  fileId: string
  uploadDate: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export class ManualsAPI {
  private static STORAGE_KEY = "manuals"

  static async getAll(): Promise<Manual[]> {
    const manuals = LocalStorage.get<Manual[]>(this.STORAGE_KEY, [])
    return manuals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  static async getById(id: string): Promise<Manual | null> {
    const manuals = await this.getAll()
    return manuals.find((m) => m.id === id) || null
  }

  static async create(
    manualData: Omit<
      Manual,
      "id" | "fileSize" | "fileName" | "fileType" | "fileId" | "uploadDate" | "createdAt" | "updatedAt"
    >,
    file: File,
  ): Promise<Manual> {
    const manuals = await this.getAll()

    // Guardar archivo
    const fileId = await FileStorage.saveFile(file)

    const newManual: Manual = {
      ...manualData,
      id: Date.now().toString(),
      fileSize: this.formatFileSize(file.size),
      fileName: file.name,
      fileType: this.getFileType(file.name),
      fileId,
      uploadDate: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    manuals.push(newManual)
    LocalStorage.set(this.STORAGE_KEY, manuals)

    return newManual
  }

  static async delete(id: string): Promise<boolean> {
    const manuals = await this.getAll()
    const manualToDelete = manuals.find((m) => m.id === id)

    if (!manualToDelete) return false

    // Eliminar archivo
    FileStorage.deleteFile(manualToDelete.fileId)

    const filteredManuals = manuals.filter((m) => m.id !== id)
    LocalStorage.set(this.STORAGE_KEY, filteredManuals)

    return true
  }

  static async downloadFile(id: string): Promise<{ file: File; fileName: string } | null> {
    const manual = await this.getById(id)
    if (!manual) return null

    const file = FileStorage.getFile(manual.fileId)
    if (!file) return null

    return { file, fileName: manual.fileName }
  }

  static getFileUrl(id: string): string | null {
    const manuals = LocalStorage.get<Manual[]>(this.STORAGE_KEY, [])
    const manual = manuals.find((m) => m.id === id)

    if (!manual) return null

    return FileStorage.getFileUrl(manual.fileId)
  }

  static async search(query: string): Promise<Manual[]> {
    const manuals = await this.getAll()
    const lowercaseQuery = query.toLowerCase()

    return manuals.filter(
      (manual) =>
        manual.title.toLowerCase().includes(lowercaseQuery) ||
        manual.brand.toLowerCase().includes(lowercaseQuery) ||
        manual.model.toLowerCase().includes(lowercaseQuery) ||
        manual.year.includes(query),
    )
  }

  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  private static getFileType(filename: string): string {
    const extension = filename.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return "PDF"
      case "doc":
        return "Word Document"
      case "docx":
        return "Word Document"
      case "txt":
        return "Text File"
      default:
        return "Unknown"
    }
  }
}
