"use client"

import { Menu, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Sidebar } from "./sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <>
      <header className="bg-[#004386] text-white p-4 relative z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-[#005ea6]"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link href="/" className="block">
              <div className="hover:opacity-90 transition-opacity cursor-pointer">
                <img
                  src="/club-del-1500-header-logo.png"
                  alt="Club del 1500 Oficial"
                  className="h-12 w-auto object-contain"
                  onError={(e) => {
                    // Fallback al texto si la imagen no carga
                    e.currentTarget.style.display = "none"
                    const parent = e.currentTarget.parentElement
                    if (parent) {
                      parent.innerHTML = '<span class="text-white font-bold text-lg px-4 py-1">Club del 1500</span>'
                    }
                  }}
                />
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="flex items-center gap-2 text-sm">
                <span>{currentUser.username}</span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    currentUser.role === "admin" ? "bg-yellow-500 text-black" : "bg-gray-500 text-white"
                  }`}
                >
                  {currentUser.role === "admin" ? "Admin" : "Usuario"}
                </span>
              </div>
            )}
            {currentUser ? (
              <Button variant="ghost" size="icon" className="text-white hover:bg-[#005ea6]" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="text-white hover:bg-[#005ea6]">
                <User className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  )
}
