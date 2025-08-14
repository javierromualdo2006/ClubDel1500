"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  LinkIcon,
  ExternalLink,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Footer } from "./footer"
import { useAuth } from "@/contexts/auth-context"
import { contentAPI } from "@/lib/api/content-api"

interface ContentElement {
  id: string
  type: "title" | "paragraph" | "link" | "image" | "slider"
  content: string
  url?: string
  linkText?: string
  imageUrl?: string
  imageAlt?: string
  images?: Array<{ url: string; alt: string; caption?: string }>
}

interface ContentCard {
  id: string
  title: string
  elements: ContentElement[]
}

export function ContentPage() {
  const { isAdmin } = useAuth()
  const [contentCards, setContentCards] = useState<ContentCard[]>([])
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [editElements, setEditElements] = useState<ContentElement[]>([])
  const [editCardTitle, setEditCardTitle] = useState("")
  const [sliderStates, setSliderStates] = useState<{ [key: string]: number }>({})

  // Load content sections from storage on component mount
  useEffect(() => {
    const loadedSections = contentAPI.loadAll()
    if (loadedSections.length > 0) {
      const validatedSections = loadedSections.map((card) => ({
        ...card,
        elements: Array.isArray(card.elements) ? card.elements : [],
      }))
      setContentCards(validatedSections)
    } else {
      // Set default content if no sections exist
      const defaultSections = [
        {
          id: "1",
          title: "Sección Principal",
          elements: [
            {
              id: "1",
              type: "title" as const,
              content: "Sección Principal",
            },
            {
              id: "2",
              type: "paragraph" as const,
              content:
                "Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            },
          ],
        },
      ]
      setContentCards(defaultSections)
      contentAPI.saveAll(defaultSections)
    }
  }, [])

  // Clean up when unmounting
  useEffect(() => {
    return () => {
      editElements.forEach((el) => {
        if (el.type === "image" && el.imageUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(el.imageUrl)
        }
        if (el.type === "slider" && el.images) {
          el.images.forEach((img) => {
            if (img.url.startsWith("blob:")) {
              URL.revokeObjectURL(img.url)
            }
          })
        }
      })
    }
  }, [editElements])

  const handleEditCard = (cardId: string) => {
    const card = contentCards.find((c) => c.id === cardId)
    if (card) {
      const elements = Array.isArray(card.elements) ? card.elements : []
      setEditElements([...elements])
      setEditCardTitle(card.title)
      setEditingCardId(cardId)
    }
  }

  const handleSaveCard = () => {
    if (editingCardId) {
      const updatedCards = contentCards.map((card) =>
        card.id === editingCardId
          ? {
              ...card,
              title: editCardTitle,
              elements: [...editElements],
            }
          : card,
      )
      setContentCards(updatedCards)
      setEditingCardId(null)
      setEditElements([])
      setEditCardTitle("")
      contentAPI.saveAll(updatedCards)
    }
  }

  const handleCancelEdit = () => {
    // Clean up temporary URLs
    editElements.forEach((el) => {
      if (el.type === "image" && el.imageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(el.imageUrl)
      }
      if (el.type === "slider" && el.images) {
        el.images.forEach((img) => {
          if (img.url.startsWith("blob:")) {
            URL.revokeObjectURL(img.url)
          }
        })
      }
    })

    setEditingCardId(null)
    setEditElements([])
    setEditCardTitle("")
  }

  const addNewCard = () => {
    const newCard: ContentCard = {
      id: Date.now().toString(),
      title: "Nueva Sección",
      elements: [
        {
          id: Date.now().toString() + "_1",
          type: "title",
          content: "Nueva Sección",
        },
        {
          id: Date.now().toString() + "_2",
          type: "paragraph",
          content: "Escribe aquí el contenido de tu nueva sección.",
        },
      ],
    }
    const updatedCards = [...contentCards, newCard]
    setContentCards(updatedCards)
    contentAPI.saveAll(updatedCards)
  }

  const deleteCard = (cardId: string) => {
    const updatedCards = contentCards.filter((card) => card.id !== cardId)
    setContentCards(updatedCards)
    contentAPI.saveAll(updatedCards)
  }

  const addNewElement = (type: "title" | "paragraph" | "link" | "image" | "slider") => {
    const newElement: ContentElement = {
      id: Date.now().toString(),
      type,
      content: "", // Dejamos el contenido vacío inicialmente
      ...(type === "link" && {
        url: "https://ejemplo.com",
        linkText: "", // Texto vacío para que el usuario pueda escribir
      }),
      ...(type === "image" && {
        imageUrl: "/placeholder.svg?height=300&width=600&text=Nueva+Imagen",
        imageAlt: "Nueva imagen",
      }),
      ...(type === "slider" && {
        images: [
          { url: "/placeholder.svg?height=300&width=600&text=Imagen+1", alt: "Imagen 1", caption: "Primera imagen" },
          { url: "/placeholder.svg?height=300&width=600&text=Imagen+2", alt: "Imagen 2", caption: "Segunda imagen" },
          { url: "/placeholder.svg?height=300&width=600&text=Imagen+3", alt: "Imagen 3", caption: "Tercera imagen" },
        ],
      }),
    };
  
    // Solo establecemos el contenido por defecto si no es un link
    if (type !== "link") {
      newElement.content = 
        type === "title"
          ? "Nuevo Título"
          : type === "paragraph"
            ? "Nuevo texto. Escribe aquí tu contenido."
            : type === "image"
              ? "Nueva Imagen"
              : "Nuevo Slider";
    }
  
    setEditElements([...editElements, newElement]);
  };

  const updateElement = (id: string, field: string, value: string) => {
    setEditElements(editElements.map((el) => (el.id === id ? { ...el, [field]: value } : el)))
  }

  const updateSliderImage = (elementId: string, imageIndex: number, field: string, value: string) => {
    setEditElements(
      editElements.map((el) => {
        if (el.id === elementId && el.images) {
          const updatedImages = [...el.images]
          updatedImages[imageIndex] = { ...updatedImages[imageIndex], [field]: value }
          return { ...el, images: updatedImages }
        }
        return el
      }),
    )
  }

  const addSliderImage = (elementId: string) => {
    setEditElements(
      editElements.map((el) => {
        if (el.id === elementId && el.images) {
          return {
            ...el,
            images: [
              ...el.images,
              {
                url: "/placeholder.svg?height=300&width=600&text=Nueva+Imagen",
                alt: "Nueva imagen",
                caption: "Nueva imagen",
              },
            ],
          }
        }
        return el
      }),
    )
  }

  const removeSliderImage = (elementId: string, imageIndex: number) => {
    setEditElements(
      editElements.map((el) => {
        if (el.id === elementId && el.images && el.images.length > 1) {
          const imageToRemove = el.images[imageIndex]
          if (imageToRemove.url.startsWith("blob:")) {
            URL.revokeObjectURL(imageToRemove.url)
          }
          const updatedImages = el.images.filter((_, index) => index !== imageIndex)
          return { ...el, images: updatedImages }
        }
        return el
      }),
    )
  }

  const deleteElement = (id: string) => {
    const elementToDelete = editElements.find((el) => el.id === id)
    if (elementToDelete) {
      if (elementToDelete.type === "image" && elementToDelete.imageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(elementToDelete.imageUrl)
      }
      if (elementToDelete.type === "slider" && elementToDelete.images) {
        elementToDelete.images.forEach((img) => {
          if (img.url.startsWith("blob:")) {
            URL.revokeObjectURL(img.url)
          }
        })
      }
    }
    setEditElements(editElements.filter((el) => el.id !== id))
  }

  const moveElement = (id: string, direction: "up" | "down") => {
    const currentIndex = editElements.findIndex((el) => el.id === id)
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === editElements.length - 1)
    ) {
      return
    }

    const updatedElements = [...editElements]
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

    // Swap elements
    const temp = updatedElements[currentIndex]
    updatedElements[currentIndex] = updatedElements[targetIndex]
    updatedElements[targetIndex] = temp

    setEditElements(updatedElements)
  }

  const nextSlide = (elementId: string, totalImages: number) => {
    setSliderStates((prev) => ({
      ...prev,
      [elementId]: ((prev[elementId] || 0) + 1) % totalImages,
    }))
  }

  const prevSlide = (elementId: string, totalImages: number) => {
    setSliderStates((prev) => ({
      ...prev,
      [elementId]: ((prev[elementId] || 0) - 1 + totalImages) % totalImages,
    }))
  }

  const goToSlide = (elementId: string, slideIndex: number) => {
    setSliderStates((prev) => ({
      ...prev,
      [elementId]: slideIndex,
    }))
  }

  const renderElement = (element: ContentElement) => {
    if (element.type === "title") {
      return (
        <h2 key={element.id} className="text-xl font-semibold text-[#000000] mb-4">
          {element.content}
        </h2>
      )
    } else if (element.type === "paragraph") {
      return (
        <p key={element.id} className="text-sm text-[#000000] leading-relaxed mb-4">
          {element.content}
        </p>
      )
    } else if (element.type === "link") {
      return (
        <div key={element.id} className="mb-4">
          <a
            href={element.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#004386] hover:text-[#005ea6] hover:underline font-medium transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            {element.linkText || element.content}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )
    } else if (element.type === "image") {
      return (
        <div key={element.id} className="mb-6 flex justify-center">
          <div className="max-w-full">
            <img
              src={element.imageUrl || "/placeholder.svg?text=Imagen"}
              alt={element.imageAlt || "Imagen"}
              className="max-w-full h-auto rounded-lg shadow-md"
              style={{ maxHeight: "80vh" }}
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?text=Error+al+cargar+imagen"
              }}
            />
            {element.imageAlt && <p className="text-center text-sm text-gray-600 mt-2 italic">{element.imageAlt}</p>}
          </div>
        </div>
      )
    } else if (element.type === "slider" && element.images && element.images.length > 0) {
      const currentSlide = sliderStates[element.id] || 0
      const currentImage = element.images[currentSlide]

      return (
        <div key={element.id} className="mb-6">
          <div className="relative max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <img
                src={currentImage.url || "/placeholder.svg"}
                alt={currentImage.alt}
                className="w-full h-64 md:h-96 object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=400&width=800&text=Error+al+cargar+imagen"
                }}
              />

              {/* Navigation controls */}
              {element.images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={() => prevSlide(element.id, element.images!.length)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={() => nextSlide(element.id, element.images!.length)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Caption */}
              {currentImage.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
                  <p className="text-center">{currentImage.caption}</p>
                </div>
              )}
            </div>

            {/* Indicators */}
            {element.images.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {element.images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide ? "bg-[#004386]" : "bg-gray-300"
                    }`}
                    onClick={() => goToSlide(element.id, index)}
                  />
                ))}
              </div>
            )}

            {/* Counter */}
            {element.images.length > 1 && (
              <div className="text-center mt-2 text-sm text-gray-600">
                {currentSlide + 1} de {element.images.length}
              </div>
            )}
          </div>
        </div>
      )
    }
  }

  const renderEditElement = (element: ContentElement, index: number) => {
    return (
      <div key={element.id} className="border rounded-lg p-4 bg-white mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              {element.type === "title"
                ? "Título"
                : element.type === "paragraph"
                  ? "Texto"
                  : element.type === "link"
                    ? "Link"
                    : element.type === "image"
                      ? "Imagen"
                      : "Slider"}
            </span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => moveElement(element.id, "up")} disabled={index === 0}>
                <ChevronUp className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => moveElement(element.id, "down")}
                disabled={index === editElements.length - 1}
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-red-500 hover:text-red-700 hover:bg-red-50 bg-transparent"
            onClick={() => deleteElement(element.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        {element.type === "title" ? (
          <Input
            value={element.content}
            onChange={(e) => updateElement(element.id, "content", e.target.value)}
            className="font-semibold"
            placeholder="Escribe el título aquí"
          />
        ) : element.type === "paragraph" ? (
          <Textarea
            value={element.content}
            onChange={(e) => updateElement(element.id, "content", e.target.value)}
            className="min-h-[100px] text-sm leading-relaxed"
            placeholder="Escribe el texto aquí"
          />
        ) : element.type === "link" ? (
          <div className="space-y-3">
            <div>
              <label htmlFor={`linkText-${element.id}`} className="text-sm font-medium">
                Texto del link
              </label>
              <Input
                id={`linkText-${element.id}`}
                value={element.linkText || element.content}
                onChange={(e) => updateElement(element.id, "linkText", e.target.value)}
                placeholder="Texto que se mostrará"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor={`url-${element.id}`} className="text-sm font-medium">
                URL del link
              </label>
              <Input
                id={`url-${element.id}`}
                value={element.url || ""}
                onChange={(e) => updateElement(element.id, "url", e.target.value)}
                placeholder="https://ejemplo.com"
                className="mt-1"
              />
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Vista previa:</p>
              <a
                href={element.url || "#"}
                className="inline-flex items-center gap-2 text-[#004386] hover:text-[#005ea6] hover:underline font-medium transition-colors text-sm"
                onClick={(e) => e.preventDefault()}
              >
                <LinkIcon className="w-4 h-4" />
                {element.linkText || element.content || "Texto del link"}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : element.type === "image" ? (
          <div className="space-y-3">
            <div>
              <label htmlFor={`imageUrl-${element.id}`} className="text-sm font-medium">
                URL de la imagen
              </label>
              <Input
                id={`imageUrl-${element.id}`}
                value={element.imageUrl || ""}
                onChange={(e) => updateElement(element.id, "imageUrl", e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor={`imageAlt-${element.id}`} className="text-sm font-medium">
                Texto alternativo
              </label>
              <Input
                id={`imageAlt-${element.id}`}
                value={element.imageAlt || ""}
                onChange={(e) => updateElement(element.id, "imageAlt", e.target.value)}
                placeholder="Descripción de la imagen"
                className="mt-1"
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Vista previa:</p>
              <div className="flex justify-center">
                <img
                  src={element.imageUrl || "/placeholder.svg?height=150&width=300&text=Vista+previa"}
                  alt={element.imageAlt || "Vista previa"}
                  className="max-w-full h-auto max-h-40 object-contain rounded border"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=150&width=300&text=Error+al+cargar"
                  }}
                />
              </div>
            </div>
          </div>
        ) : element.type === "slider" && element.images ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Imágenes del slider</label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addSliderImage(element.id)}
                className="bg-green-50 hover:bg-green-100"
              >
                <Plus className="w-3 h-3 mr-1" />
                Agregar Imagen
              </Button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {element.images.map((image, imageIndex) => (
                <div key={imageIndex} className="border rounded p-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-600">Imagen {imageIndex + 1}</span>
                    {element.images!.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 bg-transparent"
                        onClick={() => removeSliderImage(element.id, imageIndex)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-xs">URL de la imagen:</label>
                      <Input
                        value={image.url}
                        onChange={(e) => updateSliderImage(element.id, imageIndex, "url", e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        className="text-xs"
                      />
                    </div>

                    <Input
                      value={image.alt}
                      onChange={(e) => updateSliderImage(element.id, imageIndex, "alt", e.target.value)}
                      placeholder="Texto alternativo"
                      className="text-xs"
                    />
                    <Input
                      value={image.caption || ""}
                      onChange={(e) => updateSliderImage(element.id, imageIndex, "caption", e.target.value)}
                      placeholder="Caption (opcional)"
                      className="text-xs"
                    />

                    <div className="pt-2">
                      <img
                        src={image.url || "/placeholder.svg?height=100&width=200&text=Imagen"}
                        alt={`Preview ${imageIndex + 1}`}
                        className="w-full h-20 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=100&width=200&text=Error"
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Vista previa del slider:</p>
              <div className="relative">
                <img
                  src={element.images[0]?.url || "/placeholder.svg?height=100&width=200&text=Slider"}
                  alt="Vista previa del slider"
                  className="w-full max-w-xs h-24 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=100&width=200&text=Error"
                  }}
                />
                <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {element.images.length} imágenes
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#000000]"></h1>

            {isAdmin() && (
              <Button onClick={addNewCard} className="bg-[#004386] hover:bg-[#005ea6] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Sección
              </Button>
            )}
          </div>

          <div className="space-y-6 pb-8">
            {contentCards.map((card) => (
              <div key={card.id} className="bg-[#d9d9d9] rounded-lg p-6 relative">
                <div className="flex justify-between items-start mb-6">
                  {editingCardId === card.id ? (
                    <div className="flex-1 mr-4">
                      <Input
                        value={editCardTitle}
                        onChange={(e) => setEditCardTitle(e.target.value)}
                        className="text-xl font-bold bg-white"
                        placeholder="Título de la sección"
                      />
                    </div>
                  ) : (
                    <h2 className="text-xl font-bold text-[#000000]">{card.title}</h2>
                  )}

                  {isAdmin() && (
                    <div className="flex gap-2">
                      {editingCardId === card.id ? (
                        <>
                          <Button size="sm" onClick={handleSaveCard} className="bg-green-600 hover:bg-green-700">
                            <Save className="w-4 h-4 mr-1" />
                            Guardar
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEditCard(card.id)}>
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 bg-transparent"
                            onClick={() => deleteCard(card.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Eliminar
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {editingCardId === card.id && isAdmin() ? (
                  <div className="space-y-4">
                    {editElements.map((element, index) => renderEditElement(element, index))}

                    <div className="flex gap-2 pt-4 border-t flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addNewElement("title")}
                        className="bg-blue-50 hover:bg-blue-100"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Título
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addNewElement("paragraph")}
                        className="bg-green-50 hover:bg-green-100"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Texto
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addNewElement("link")}
                        className="bg-purple-50 hover:bg-purple-100"
                      >
                        <LinkIcon className="w-3 h-3 mr-1" />
                        Link
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addNewElement("image")}
                        className="bg-orange-50 hover:bg-orange-100"
                      >
                        <ImageIcon className="w-3 h-3 mr-1" />
                        Imagen
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addNewElement("slider")}
                        className="bg-pink-50 hover:bg-pink-100"
                      >
                        <ChevronRight className="w-3 h-3 mr-1" />
                        Slider
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {Array.isArray(card.elements) ? card.elements.map((element) => renderElement(element)) : null}
                  </div>
                )}
              </div>
            ))}
          </div>

          {contentCards.length === 0 && isAdmin() && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-gray-400 mb-4">
                <Plus className="w-12 h-12 mx-auto mb-2" />
                <p>No hay secciones de contenido</p>
              </div>
              <Button onClick={addNewCard} className="bg-[#004386] hover:bg-[#005ea6] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Sección
              </Button>
            </div>
          )}

          {contentCards.length === 0 && !isAdmin() && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay contenido disponible</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}