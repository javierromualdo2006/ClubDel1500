"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Download, Trash2, FileText, X, Search } from "lucide-react"
import { Footer } from "./footer"
import { useAuth } from "@/contexts/auth-context"
import { ManualsAPI, type Manual } from "@/lib/api/manuals"

function ManualesPage() {
  const { isAdmin, currentUser } = useAuth()
  const [manuales, setManuales] = useState<Manual[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    model: "",
    year: "",
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const loadManuals = async () => {
    try {
      setLoading(true)
      const allManuals = await ManualsAPI.getAll()
      setManuales(allManuals)
      console.log("Manuales cargados:", allManuals.length)
    } catch (error) {
      console.error("Error cargando manuales:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadManuals()
  }, [])

  const filteredManuals = manuales.filter(
    (manual) =>
      manual.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manual.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manual.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manual.year.includes(searchQuery),
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamaño del archivo (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        alert("El archivo es demasiado grande. Máximo 10MB permitido.")
        return
      }

      // Validar tipo de archivo
      const allowedTypes = [".pdf", ".doc", ".docx", ".txt"]
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

      if (!allowedTypes.includes(fileExtension)) {
        alert("Tipo de archivo no permitido. Use PDF, DOC, DOCX o TXT.")
        return
      }

      setSelectedFile(file)
      // Auto-completar el título si está vacío
      if (!formData.title) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "")
        setFormData((prev) => ({ ...prev, title: nameWithoutExtension }))
      }
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileType = (filename: string): string => {
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

  const handleSubmit = async () => {
    if (formData.title && formData.brand && formData.model && formData.year && selectedFile && currentUser) {
      try {
        const newManual = await ManualsAPI.create(
          {
            title: formData.title,
            brand: formData.brand,
            model: formData.model,
            year: formData.year,
            createdBy: currentUser.id,
          },
          selectedFile,
        )

        await loadManuals()
        setFormData({ title: "", brand: "", model: "", year: "" })
        setSelectedFile(null)
        setIsDialogOpen(false)
      } catch (error) {
        console.error("Error guardando manual:", error)
        alert("Error guardando manual")
      }
    }
  }

  const handleDownload = async (manual: Manual) => {
    try {
      const fileData = await ManualsAPI.downloadFile(manual.id)

      if (fileData && fileData.file) {
        // Create download link without using blob URLs in src attributes
        const url = URL.createObjectURL(fileData.file)
        const link = document.createElement("a")
        link.href = url
        link.download = fileData.fileName || manual.fileName
        link.style.display = "none"

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up immediately
        setTimeout(() => URL.revokeObjectURL(url), 100)

        // Show success notification
        const notification = document.createElement("div")
        notification.textContent = `Descargando: ${fileData.fileName || manual.fileName}`
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #16a34a;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          z-index: 1000;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `

        document.body.appendChild(notification)
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 3000)
      } else {
        alert("No se puede descargar el archivo. Archivo no disponible.")
      }
    } catch (error) {
      console.error("Error descargando archivo:", error)
      alert("Error descargando archivo. Intenta nuevamente.")
    }
  }

  const deleteManual = async (manualId: string) => {
    try {
      const success = await ManualsAPI.delete(manualId)
      if (success) {
        await loadManuals()
        // Simple notification instead of popup
        const notification = document.createElement("div")
        notification.textContent = "Manual eliminado correctamente"
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #dc2626;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          z-index: 1000;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `
        document.body.appendChild(notification)
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 3000)
      }
    } catch (error) {
      console.error("Error eliminando manual:", error)
      alert("Error eliminando manual")
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004386] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando manuales...</p>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[#000000]">Manuales del Auto</h1>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar manuales..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              {isAdmin() && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#004386] hover:bg-[#005ea6] text-white w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Manual
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md mx-auto">
                    <DialogHeader>
                      <DialogTitle>Agregar Nuevo Manual</DialogTitle>
                      <DialogDescription>
                        Sube un manual de auto completando la información del vehículo y seleccionando el archivo.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="title">Título del manual</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Ej: Manual del Usuario"
                        />
                      </div>
                      <div>
                        <Label htmlFor="brand">Marca</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          placeholder="Ej: Toyota"
                        />
                      </div>
                      <div>
                        <Label htmlFor="model">Modelo</Label>
                        <Input
                          id="model"
                          value={formData.model}
                          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                          placeholder="Ej: Corolla"
                        />
                      </div>
                      <div>
                        <Label htmlFor="year">Año</Label>
                        <select
                          id="year"
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Seleccionar año</option>
                          {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                            <option key={year} value={year.toString()}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="file">Archivo del manual</Label>
                        <Input
                          id="file"
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileChange}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Formatos permitidos: PDF, DOC, DOCX, TXT (Máximo 10MB)
                        </p>
                        {selectedFile && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-blue-900 truncate">{selectedFile.name}</p>
                                <p className="text-xs text-blue-600">
                                  {formatFileSize(selectedFile.size)} • {getFileType(selectedFile.name)}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedFile(null)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={handleSubmit}
                          className="bg-[#004386] hover:bg-[#005ea6] flex-1"
                          disabled={!selectedFile}
                        >
                          Agregar Manual
                        </Button>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {searchQuery && (
            <div className="mb-4 text-sm text-gray-600">
              Mostrando {filteredManuals.length} de {manuales.length} manuales
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
            {filteredManuals.map((manual) => (
              <Card key={manual.id} className="bg-[#d9d9d9] w-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg text-[#000000] line-clamp-2">{manual.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm text-[#000000]">
                      <strong>Marca:</strong> {manual.brand}
                    </p>
                    <p className="text-sm text-[#000000]">
                      <strong>Modelo:</strong> {manual.model}
                    </p>
                    <p className="text-sm text-[#000000]">
                      <strong>Año:</strong> {manual.year}
                    </p>
                    <p className="text-xs text-gray-600 truncate" title={manual.fileName}>
                      <strong>Archivo:</strong> {manual.fileName}
                    </p>
                    <p className="text-xs text-blue-600">
                      <strong>Tipo:</strong> {manual.fileType}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Tamaño:</strong> {manual.fileSize}
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>Subido:</strong> {manual.uploadDate}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs bg-transparent hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                      onClick={() => handleDownload(manual)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Descargar
                    </Button>
                    {isAdmin() && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 bg-transparent px-2"
                        onClick={() => deleteManual(manual.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredManuals.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                {searchQuery
                  ? "No se encontraron manuales que coincidan con tu búsqueda"
                  : "No hay manuales disponibles"}
              </div>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery("")} className="text-sm">
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export { ManualesPage }
export default ManualesPage
