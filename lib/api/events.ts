import { storage } from "@/lib/storage"

export interface Event {
  id: string
  date: number
  month: number
  year: number
  title: string
  time: string
  description: string
  address: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

const STORAGE_KEY = "events"

// Datos iniciales
const initialEvents: Event[] = [
  {
    id: "1",
    date: 15,
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    title: "Reunión de equipo",
    time: "10:00 AM",
    description: "Reunión mensual del equipo para revisar objetivos y planificar las actividades del próximo mes.",
    address: "Sala de Conferencias A, Edificio Principal, Piso 3",
    imageUrl: "/team-meeting-office.png",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    date: 22,
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    title: "Presentación cliente",
    time: "2:00 PM",
    description: "Presentación del proyecto final al cliente ABC Corp.",
    address: "Oficinas ABC Corp, Av. Principal 123, Torre Empresarial, Piso 15",
    imageUrl: "/business-presentation-client-meeting.png",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const eventsAPI = {
  getAll: async (): Promise<Event[]> => {
    try {
      const events = storage.get(STORAGE_KEY) || initialEvents
      storage.set(STORAGE_KEY, events) // Asegurar que los datos iniciales se guarden
      return events
    } catch (error) {
      console.error("Error loading events:", error)
      return initialEvents
    }
  },

  create: async (eventData: Omit<Event, "id" | "createdAt" | "updatedAt">): Promise<Event> => {
    try {
      const events = storage.get(STORAGE_KEY) || []
      const newEvent: Event = {
        ...eventData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedEvents = [...events, newEvent]
      storage.set(STORAGE_KEY, updatedEvents)

      console.log("Event created:", newEvent)
      return newEvent
    } catch (error) {
      console.error("Error creating event:", error)
      throw error
    }
  },

  update: async (id: string, eventData: Partial<Event>): Promise<Event> => {
    try {
      const events = storage.get(STORAGE_KEY) || []
      const eventIndex = events.findIndex((event: Event) => event.id === id)

      if (eventIndex === -1) {
        throw new Error("Event not found")
      }

      const updatedEvent = {
        ...events[eventIndex],
        ...eventData,
        updatedAt: new Date(),
      }

      events[eventIndex] = updatedEvent
      storage.set(STORAGE_KEY, events)

      console.log("Event updated:", updatedEvent)
      return updatedEvent
    } catch (error) {
      console.error("Error updating event:", error)
      throw error
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const events = storage.get(STORAGE_KEY) || []
      const filteredEvents = events.filter((event: Event) => event.id !== id)
      storage.set(STORAGE_KEY, filteredEvents)

      console.log("Event deleted:", id)
    } catch (error) {
      console.error("Error deleting event:", error)
      throw error
    }
  },
}
