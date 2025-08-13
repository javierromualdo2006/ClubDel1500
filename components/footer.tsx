"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Edit, Save, X, Plus, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface SocialNetwork {
  id: string
  name: string
  url: string
  icon: string
}

export function Footer() {
  const { isAdmin } = useAuth()
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([
    { id: "1", name: "Facebook", url: "https://facebook.com/empresa", icon: "facebook" },
    { id: "2", name: "Twitter", url: "https://twitter.com/empresa", icon: "twitter" },
    { id: "3", name: "Instagram", url: "https://instagram.com/empresa", icon: "instagram" },
    { id: "4", name: "TikTok", url: "https://tiktok.com/@empresa", icon: "tiktok" },
  ])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editSocialNetworks, setEditSocialNetworks] = useState<SocialNetwork[]>([])

  const availableSocialNetworks = [
    { value: "tiktok", label: "TikTok", icon: "tiktok" },
    { value: "facebook", label: "Facebook", icon: "facebook" },
    { value: "twitter", label: "Twitter", icon: "twitter" },
    { value: "instagram", label: "Instagram", icon: "instagram" },
    { value: "linkedin", label: "LinkedIn", icon: "linkedin" },
    { value: "youtube", label: "YouTube", icon: "youtube" },
    { value: "whatsapp", label: "WhatsApp", icon: "whatsapp" },
    { value: "website", label: "Sitio Web", icon: "website" },
  ]

  const handleEditSocials = () => {
    setEditSocialNetworks([...socialNetworks])
    setIsDialogOpen(true)
  }

  const handleSaveSocials = () => {
    setSocialNetworks([...editSocialNetworks])
    setIsDialogOpen(false)
    setEditSocialNetworks([])
  }

  const handleCancelEdit = () => {
    setIsDialogOpen(false)
    setEditSocialNetworks([])
  }

  const addSocialNetwork = () => {
    const newSocial: SocialNetwork = {
      id: Date.now().toString(),
      name: "TikTok",
      url: "https://tiktok.com/@empresa",
      icon: "tiktok",
    }
    setEditSocialNetworks([...editSocialNetworks, newSocial])
  }

  const updateSocialNetwork = (id: string, field: string, value: string) => {
    setEditSocialNetworks(
      editSocialNetworks.map((social) => (social.id === id ? { ...social, [field]: value } : social)),
    )
  }

  const deleteSocialNetwork = (id: string) => {
    setEditSocialNetworks(editSocialNetworks.filter((social) => social.id !== id))
  }

  return (
    <footer className="w-full bg-[#004386] text-white p-6">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <h3 className="font-medium">Redes Sociales</h3>
            {isAdmin() && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[#004386] bg-white hover:bg-gray-100"
                    onClick={handleEditSocials}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Editar Redes Sociales</DialogTitle>
                    <DialogDescription>
                      Configura las redes sociales que aparecerán en el footer del sitio web.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Configurar redes sociales</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={addSocialNetwork}
                        className="bg-blue-50 hover:bg-blue-100"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Agregar Red Social
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {editSocialNetworks.map((social) => (
                        <div key={social.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-600">{social.name}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 bg-transparent"
                              onClick={() => deleteSocialNetwork(social.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium">Tipo de red social</label>
                              <select
                                value={social.icon}
                                onChange={(e) => {
                                  const selectedNetwork = availableSocialNetworks.find((n) => n.icon === e.target.value)
                                  updateSocialNetwork(social.id, "icon", e.target.value)
                                  updateSocialNetwork(social.id, "name", selectedNetwork?.label || "")
                                }}
                                className="w-full mt-1 p-2 border rounded-md text-sm"
                              >
                                {availableSocialNetworks.map((network) => (
                                  <option key={network.value} value={network.icon}>
                                    {network.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-sm font-medium">URL</label>
                              <Input
                                value={social.url}
                                onChange={(e) => updateSocialNetwork(social.id, "url", e.target.value)}
                                placeholder="https://ejemplo.com"
                                className="mt-1"
                              />
                            </div>

                            <div className="p-3 bg-white rounded-lg border">
                              <p className="text-xs text-gray-600 mb-2">Vista previa:</p>
                              <a
                                href={social.url || "#"}
                                className="inline-flex items-center gap-2 text-[#004386] hover:text-[#005ea6] hover:underline font-medium transition-colors text-sm"
                                onClick={(e) => e.preventDefault()}
                              >
                                {social.name}
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {editSocialNetworks.length === 0 && (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-sm">No hay redes sociales configuradas</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t">
                      <Button onClick={handleSaveSocials} className="bg-[#004386] hover:bg-[#005ea6]">
                        <Save className="w-4 h-4 mr-1" />
                        Guardar Cambios
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="flex gap-3">
            {socialNetworks.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-200 transition-colors"
                title={social.name}
              >
                <span className="text-sm">{social.name}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="text-center border-t border-white/20 pt-4">
          <p className="text-sm opacity-90">© 2024 Sistema de Gestión. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
