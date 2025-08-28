// app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { DatabaseConnectionHandler } from "@/components/database-connection-handler" // ← Cambiado a default import

const geistSans = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "Club del 1500 - Sistema de Gestión",
  description: "Sistema de gestión empresarial del Club del 1500",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <DatabaseConnectionHandler>
          <AuthProvider>{children}</AuthProvider>
        </DatabaseConnectionHandler>
      </body>
    </html>
  )
}