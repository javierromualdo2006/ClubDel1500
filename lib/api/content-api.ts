import { storage } from "../storage"

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

const STORAGE_KEY = "content_sections"

export const contentAPI = {
  // Save all content sections
  saveAll: (sections: ContentCard[]): void => {
    try {
      storage.set(STORAGE_KEY, sections)
      console.log("Content sections saved successfully")
    } catch (error) {
      console.error("Error saving content sections:", error)
      throw new Error("Failed to save content sections")
    }
  },

  // Load all content sections
  loadAll: (): ContentCard[] => {
    try {
      const sections = storage.get<ContentCard[]>(STORAGE_KEY, [])
      return sections || []
    } catch (error) {
      console.error("Error loading content sections:", error)
      return []
    }
  },

  // Save a single section
  save: (section: ContentCard): void => {
    try {
      const sections = contentAPI.loadAll()
      const existingIndex = sections.findIndex((s) => s.id === section.id)

      if (existingIndex >= 0) {
        sections[existingIndex] = section
      } else {
        sections.push(section)
      }

      contentAPI.saveAll(sections)
    } catch (error) {
      console.error("Error saving content section:", error)
      throw new Error("Failed to save content section")
    }
  },

  // Delete a section
  delete: (sectionId: string): void => {
    try {
      const sections = contentAPI.loadAll()
      const filteredSections = sections.filter((s) => s.id !== sectionId)
      contentAPI.saveAll(filteredSections)
    } catch (error) {
      console.error("Error deleting content section:", error)
      throw new Error("Failed to delete content section")
    }
  },

  // Get a single section by ID
  getById: (sectionId: string): ContentCard | null => {
    try {
      const sections = contentAPI.loadAll()
      return sections.find((s) => s.id === sectionId) || null
    } catch (error) {
      console.error("Error getting content section:", error)
      return null
    }
  },
}
