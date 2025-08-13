import { storage } from "@/lib/storage"

export interface ContentSection {
  id: string
  title: string
  description: string
  imageFile?: File
  imageUrl?: string
  order: number
  createdAt: Date
  updatedAt: Date
}

const STORAGE_KEY = "content_sections"

// Datos iniciales
const initialSections: ContentSection[] = [
  {
    id: "1",
    title: "Bienvenidos al Club del 1500",
    description: "Somos una comunidad apasionada por los automóviles clásicos y modernos.",
    imageUrl: "/placeholder-kzcly.png",
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Eventos y Reuniones",
    description: "Organizamos eventos regulares para compartir experiencias y conocimientos.",
    imageUrl: "/placeholder-atdac.png",
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const contentAPI = {
  getAll: async (): Promise<ContentSection[]> => {
    try {
      const sections = storage.get(STORAGE_KEY) || initialSections
      storage.set(STORAGE_KEY, sections)
      return sections.sort((a, b) => a.order - b.order)
    } catch (error) {
      console.error("Error loading content sections:", error)
      return initialSections
    }
  },

  create: async (sectionData: Omit<ContentSection, "id" | "createdAt" | "updatedAt">): Promise<ContentSection> => {
    try {
      const sections = storage.get(STORAGE_KEY) || []
      const newSection: ContentSection = {
        ...sectionData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedSections = [...sections, newSection]
      storage.set(STORAGE_KEY, updatedSections)

      console.log("Content section created:", newSection)
      return newSection
    } catch (error) {
      console.error("Error creating content section:", error)
      throw error
    }
  },

  update: async (id: string, sectionData: Partial<ContentSection>): Promise<ContentSection> => {
    try {
      const sections = storage.get(STORAGE_KEY) || []
      const sectionIndex = sections.findIndex((section: ContentSection) => section.id === id)

      if (sectionIndex === -1) {
        throw new Error("Content section not found")
      }

      const updatedSection = {
        ...sections[sectionIndex],
        ...sectionData,
        updatedAt: new Date(),
      }

      sections[sectionIndex] = updatedSection
      storage.set(STORAGE_KEY, sections)

      console.log("Content section updated:", updatedSection)
      return updatedSection
    } catch (error) {
      console.error("Error updating content section:", error)
      throw error
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const sections = storage.get(STORAGE_KEY) || []
      const filteredSections = sections.filter((section: ContentSection) => section.id !== id)
      storage.set(STORAGE_KEY, filteredSections)

      console.log("Content section deleted:", id)
    } catch (error) {
      console.error("Error deleting content section:", error)
      throw error
    }
  },
}
