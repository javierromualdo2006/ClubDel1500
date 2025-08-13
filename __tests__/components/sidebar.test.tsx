"use client"

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Sidebar } from "@/components/sidebar"
import { AuthProvider } from "@/contexts/auth-context"
import jest from "jest"

const mockPush = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/",
}))

const SidebarWithProvider = ({ isOpen = true, onClose = jest.fn() }) => (
  <AuthProvider>
    <Sidebar isOpen={isOpen} onClose={onClose} />
  </AuthProvider>
)

describe("Sidebar", () => {
  it("should render menu items when open", () => {
    render(<SidebarWithProvider />)

    expect(screen.getByText("Menú")).toBeInTheDocument()
    expect(screen.getByText("Inicio")).toBeInTheDocument()
    expect(screen.getByText("Productos")).toBeInTheDocument()
    expect(screen.getByText("Inicio de Sesión")).toBeInTheDocument()
    expect(screen.getByText("Calendario")).toBeInTheDocument()
    expect(screen.getByText("Manuales del Auto")).toBeInTheDocument()
  })

  it("should not show admin menu items for regular users", () => {
    render(<SidebarWithProvider />)

    // These should not be visible for non-admin users
    expect(screen.queryByText("Gestión de Usuarios")).not.toBeInTheDocument()
    expect(screen.queryByText("Enviar Emails")).not.toBeInTheDocument()
  })

  it("should call onClose when close button is clicked", async () => {
    const mockOnClose = jest.fn()
    const user = userEvent.setup()

    render(<SidebarWithProvider onClose={mockOnClose} />)

    const closeButton = screen.getByRole("button")
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it("should call onClose when menu item is clicked", async () => {
    const mockOnClose = jest.fn()
    const user = userEvent.setup()

    render(<SidebarWithProvider onClose={mockOnClose} />)

    const homeLink = screen.getByText("Inicio")
    await user.click(homeLink)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it("should have correct CSS classes when open", () => {
    const { container } = render(<SidebarWithProvider isOpen={true} />)

    const sidebar = container.querySelector("aside")
    expect(sidebar).toHaveClass("translate-x-0")
  })

  it("should have correct CSS classes when closed", () => {
    const { container } = render(<SidebarWithProvider isOpen={false} />)

    const sidebar = container.querySelector("aside")
    expect(sidebar).toHaveClass("-translate-x-full")
  })
})
