"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit, Eye, ImageIcon, X } from "lucide-react"
import { Footer } from "./footer"
import { useAuth } from "@/contexts/auth-context"
import { eventsAPI } from "@/lib/api/events"

export function CalendarPage() {
  const { isAdmin } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any | null>(null)
  const [viewingEvent, setViewingEvent] = useState<any | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    description: "",
    address: "",
    imageUrl: "",
  })

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({ date: prevDate.getDate(), isCurrentMonth: false, isToday: false })
    }

    // Días del mes actual
    const today = new Date()
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
      days.push({ date: day, isCurrentMonth: true, isToday })
    }

    // Días del siguiente mes para completar la grilla
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ date: day, isCurrentMonth: false, isToday: false })
    }

    return days
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const openAddDialog = () => {
    setEditingEvent(null)
    setNewEvent({ title: "", date: "", time: "", description: "", address: "", imageUrl: "" })
    setIsDialogOpen(true)
  }

  const openEditDialog = (event: any) => {
    setEditingEvent(event)
    const eventDate = new Date(event.year, event.month, event.date)
    const formattedDate = eventDate.toISOString().split("T")[0]
    setNewEvent({
      title: event.title,
      date: formattedDate,
      time: event.time,
      description: event.description,
      address: event.address,
      imageUrl: event.imageUrl || "",
    })
    setIsDialogOpen(true)
  }

  const openViewDialog = (event: any) => {
    setViewingEvent(event)
    setIsViewDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (newEvent.title && newEvent.date && newEvent.time && newEvent.address) {
      const eventDate = new Date(newEvent.date)

      try {
        if (editingEvent) {
          const updatedEvent = await eventsAPI.update(editingEvent.id, {
            date: eventDate.getDate(),
            month: eventDate.getMonth(),
            year: eventDate.getFullYear(),
            title: newEvent.title,
            time: newEvent.time,
            description: newEvent.description,
            address: newEvent.address,
            imageUrl: newEvent.imageUrl || undefined,
          })
          setEvents(events.map((event) => (event.id === editingEvent.id ? updatedEvent : event)))
        } else {
          const createdEvent = await eventsAPI.create({
            date: eventDate.getDate(),
            month: eventDate.getMonth(),
            year: eventDate.getFullYear(),
            title: newEvent.title,
            time: newEvent.time,
            description: newEvent.description,
            address: newEvent.address,
            imageUrl: newEvent.imageUrl || undefined,
          })
          setEvents([...events, createdEvent])
        }

        setNewEvent({ title: "", date: "", time: "", description: "", address: "", imageUrl: "" })
        setIsDialogOpen(false)
      } catch (error) {
        console.error("Error saving event:", error)
      }
    }
  }

  const deleteEvent = async (eventId: string) => {
    try {
      await eventsAPI.delete(eventId)
      setEvents(events.filter((event) => event.id !== eventId))
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  const days = getDaysInMonth(currentDate)

  // Filtrar eventos del mes actual
  const currentMonthEvents = events.filter(
    (event) => event.month === currentDate.getMonth() && event.year === currentDate.getFullYear(),
  )

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const eventsData = await eventsAPI.getAll()
      setEvents(eventsData)
    } catch (error) {
      console.error("Error loading events:", error)
    }
  }

  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[#000000]">Calendario</h1>

            {isAdmin() && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={openAddDialog}
                    className="bg-[#004386] hover:bg-[#005ea6] text-white w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Evento
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingEvent ? "Editar Evento" : "Agregar Nuevo Evento"}</DialogTitle>
                    <DialogDescription>
                      {editingEvent
                        ? "Modifica los detalles del evento seleccionado."
                        : "Completa la información para crear un nuevo evento en el calendario."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="title">Título del evento</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="Ej: Reunión de equipo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Fecha</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Hora</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Dirección del evento</Label>
                      <Input
                        id="address"
                        value={newEvent.address}
                        onChange={(e) => setNewEvent({ ...newEvent, address: e.target.value })}
                        placeholder="Ej: Sala de Conferencias A, Edificio Principal"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        placeholder="Describe los detalles del evento..."
                        className="min-h-[100px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="imageUrl">URL de la imagen del evento (opcional)</Label>
                      <Input
                        id="imageUrl"
                        value={newEvent.imageUrl}
                        onChange={(e) => setNewEvent({ ...newEvent, imageUrl: e.target.value })}
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                      {newEvent.imageUrl && (
                        <div className="mt-2">
                          <img
                            src={newEvent.imageUrl || "/placeholder.svg"}
                            alt="Vista previa"
                            className="w-full max-w-xs h-32 object-cover rounded-lg border"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=128&width=320&text=Vista+previa"
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSubmit} className="bg-[#004386] hover:bg-[#005ea6]">
                        {editingEvent ? "Actualizar" : "Agregar"} Evento
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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 pb-8">
            <div className="xl:col-span-2">
              <Card className="w-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg sm:text-xl text-[#004386]">
                      {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")} className="h-8 w-8">
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => navigateMonth("next")} className="h-8 w-8">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <div className="grid grid-cols-7 gap-2 mb-3">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="p-2 text-center font-medium text-[#004386] text-sm">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {days.map((day, index) => {
                      const hasEvent = currentMonthEvents.some((event) => event.date === day.date && day.isCurrentMonth)

                      return (
                        <div
                          key={index}
                          className={`
                            p-3 h-12 text-center text-sm cursor-pointer rounded transition-colors flex items-center justify-center
                            ${day.isCurrentMonth ? "text-[#000000] hover:bg-gray-100" : "text-gray-400"}
                            ${day.isToday ? "bg-[#004386] text-white hover:bg-[#005ea6]" : ""}
                            ${hasEvent && !day.isToday ? "bg-[#1e90ff] text-white hover:bg-[#0080ff]" : ""}
                          `}
                        >
                          {day.date}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="xl:col-span-1">
              <Card className="w-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-[#004386]">Eventos de {months[currentDate.getMonth()]}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {currentMonthEvents.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay eventos este mes</p>
                  ) : (
                    <div className="max-h-[500px] overflow-y-auto space-y-3">
                      {currentMonthEvents.map((event) => (
                        <div key={event.id} className="p-3 bg-gray-50 rounded-lg border">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-[#000000] text-sm mb-1">{event.title}</div>
                              <div className="text-xs text-gray-600 mb-1">
                                {event.date} de {months[event.month]} - {event.time}
                              </div>
                              <div className="text-xs text-orange-600 mb-1 truncate">📍 {event.address}</div>
                              {event.imageUrl && (
                                <div className="flex items-center gap-1 text-xs text-blue-600 mb-1">
                                  <ImageIcon className="w-3 h-3 flex-shrink-0" />
                                  <span>Con imagen</span>
                                </div>
                              )}
                              <p className="text-xs text-gray-600 line-clamp-2">{event.description}</p>
                            </div>
                            <div className="flex gap-1 ml-2 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-green-500 hover:text-green-700 hover:bg-green-50"
                                onClick={() => openViewDialog(event)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {isAdmin() && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={() => openEditDialog(event)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => deleteEvent(event.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Dialog for ver detalles del evento */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl text-[#004386] pr-8">{viewingEvent?.title}</DialogTitle>
                  <DialogDescription className="sr-only">Detalles completos del evento seleccionado</DialogDescription>
                  <Button variant="ghost" size="icon" onClick={() => setIsViewDialogOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>
              {viewingEvent && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                    <span className="font-medium">
                      📅 {viewingEvent.date} de {months[viewingEvent.month]} {viewingEvent.year}
                    </span>
                    <span className="font-medium">🕐 {viewingEvent.time}</span>
                    <span className="font-medium break-all">📍 {viewingEvent.address}</span>
                  </div>

                  {viewingEvent.imageUrl && (
                    <div className="w-full">
                      <img
                        src={viewingEvent.imageUrl || "/placeholder.svg"}
                        alt={viewingEvent.title}
                        className="w-full h-48 sm:h-64 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.src = "/vibrant-outdoor-event.png"
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-[#000000] mb-2">Descripción:</h4>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {viewingEvent.description}
                    </p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </>
  )
}