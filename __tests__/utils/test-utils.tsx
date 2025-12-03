// test-utils.tsx
import type React from "react"
import type { ReactElement } from "react"
import { render as rtlRender, type RenderOptions } from "@testing-library/react"
import { AuthProvider } from "@/contexts/auth-context"

// Wrapper con tus providers globales
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>
}

// Render personalizado
const render = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => rtlRender(ui, { wrapper: AllTheProviders, ...options })

// Re-exportar todo lo de Testing Library
export * from "@testing-library/react"

// Exportar el render custom
export { render }
