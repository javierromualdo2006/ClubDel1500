import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LoginPage } from "@/components/login-page"
import { AuthProvider } from "@/contexts/auth-context"
import jest from "jest" // Import jest to declare the variable

// Mock del router
const mockPush = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const LoginPageWithProvider = () => (
  <AuthProvider>
    <LoginPage />
  </AuthProvider>
)

describe("LoginPage", () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it("should render login form", () => {
    render(<LoginPageWithProvider />)

    expect(screen.getByText("Iniciar Sesión")).toBeInTheDocument()
    expect(screen.getByLabelText("Usuario")).toBeInTheDocument()
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it("should show/hide password when toggle button is clicked", async () => {
    const user = userEvent.setup()
    render(<LoginPageWithProvider />)

    const passwordInput = screen.getByLabelText("Contraseña")
    const toggleButton = screen.getByRole("button", { name: "" }) // Eye icon button

    expect(passwordInput).toHaveAttribute("type", "password")

    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute("type", "text")

    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute("type", "password")
  })

  it("should show error for invalid credentials", async () => {
    const user = userEvent.setup()
    render(<LoginPageWithProvider />)

    const usernameInput = screen.getByLabelText("Usuario")
    const passwordInput = screen.getByLabelText("Contraseña")
    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i })

    await user.type(usernameInput, "wronguser")
    await user.type(passwordInput, "wrongpassword")
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("Usuario o contraseña incorrectos")).toBeInTheDocument()
    })
  })

  it("should login successfully with admin credentials", async () => {
    const user = userEvent.setup()
    render(<LoginPageWithProvider />)

    const usernameInput = screen.getByLabelText("Usuario")
    const passwordInput = screen.getByLabelText("Contraseña")
    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i })

    await user.type(usernameInput, "admin")
    await user.type(passwordInput, "123")
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/")
    })
  })

  it("should login successfully with regular user credentials", async () => {
    const user = userEvent.setup()
    render(<LoginPageWithProvider />)

    const usernameInput = screen.getByLabelText("Usuario")
    const passwordInput = screen.getByLabelText("Contraseña")
    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i })

    await user.type(usernameInput, "usuario")
    await user.type(passwordInput, "anypassword")
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/")
    })
  })

  it("should show loading state during login", async () => {
    const user = userEvent.setup()
    render(<LoginPageWithProvider />)

    const usernameInput = screen.getByLabelText("Usuario")
    const passwordInput = screen.getByLabelText("Contraseña")
    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i })

    await user.type(usernameInput, "admin")
    await user.type(passwordInput, "123")
    await user.click(submitButton)

    expect(screen.getByText("Iniciando sesión...")).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it("should require all fields", async () => {
    const user = userEvent.setup()
    render(<LoginPageWithProvider />)

    const submitButton = screen.getByRole("button", { name: /iniciar sesión/i })

    await user.click(submitButton)

    // HTML5 validation should prevent submission
    const usernameInput = screen.getByLabelText("Usuario")
    const passwordInput = screen.getByLabelText("Contraseña")

    expect(usernameInput).toBeRequired()
    expect(passwordInput).toBeRequired()
  })

  it("should have register link", () => {
    render(<LoginPageWithProvider />)

    const registerLink = screen.getByText("Regístrate aquí")
    expect(registerLink).toBeInTheDocument()
    expect(registerLink.closest("a")).toHaveAttribute("href", "/registro")
  })
})
