"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { isAdmin } = useAuth()

  const menuItems = [
    { name: "Inicio", href: "/" },
    { name: "Productos", href: "/productos" },
    { name: "Inicio de Sesión", href: "/login" },
    { name: "Calendario", href: "/calendario" },
    { name: "Manuales del Auto", href: "/manuales" },
    ...(isAdmin()
      ? [
          { name: "Gestión de Usuarios", href: "/usuarios" },
          { name: "Enviar Emails", href: "/emails" },
        ]
      : []),
  ]

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-full w-64 bg-[#005ea6] text-white z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Menú</h2>
            <Button variant="ghost" size="icon" className="text-white hover:bg-[#008cff]" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <Link key={index} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-white hover:bg-[#008cff] hover:text-white ${
                    pathname === item.href ? "bg-[#008cff]" : ""
                  }`}
                  onClick={onClose}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}
