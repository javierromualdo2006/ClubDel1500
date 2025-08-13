import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AuthProvider } from "@/contexts/auth-context"
import { LoginPage } from "@/components/login-page"
import { Header } from "@/components/header"
import jest from "jest" // Declaring the jest variable

const mockPush = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/",
}))

const AuthFlowTest = () => (
  <AuthProvider>
    <Header />
    <LoginPage />
  </AuthProvider>
)

describe("Authentication Flow Integration", () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it("should complete full login flow", async () => {
    const user = userEvent.setup()
    render(<AuthFlowTest />)

    // Initially should show login form
    expect(screen.getByText("Iniciar Sesión")).toBeInTheDocument()

    // Fill login form
    await user.type(screen.getByLabelText("Usuario"), "admin")
    await user.type(screen.getByLabelText("Contraseña"), "123")
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))

    // Should redirect to home
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/")
    })
  })

  it("should handle login failure gracefully", async () => {
    const user = userEvent.setup()
    render(<AuthFlowTest />)

    await user.type(screen.getByLabelText("Usuario"), "wronguser")
    await user.type(screen.getByLabelText("Contraseña"), "wrongpass")
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByText("Usuario o contraseña incorrectos")).toBeInTheDocument()
    })

    // Should not redirect
    expect(mockPush).not.toHaveBeenCalled()
  })
})
