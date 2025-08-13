import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RegisterPage } from "@/components/register-page"
import { AuthProvider } from "@/contexts/auth-context"
import jest from "jest"

const mockPush = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const RegisterPageWithProvider = () => (
  <AuthProvider>
    <RegisterPage />
  </AuthProvider>
)

describe("RegisterPage", () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it("should render registration form", () => {
    render(<RegisterPageWithProvider />)

    expect(screen.getByText("Crear Cuenta")).toBeInTheDocument()
    expect(screen.getByLabelText("Nombre de usuario")).toBeInTheDocument()
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument()
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument()
    expect(screen.getByLabelText("Confirmar contraseña")).toBeInTheDocument()
  })

  it("should show error when passwords do not match", async () => {
    const user = userEvent.setup()
    render(<RegisterPageWithProvider />)

    await user.type(screen.getByLabelText("Nombre de usuario"), "testuser")
    await user.type(screen.getByLabelText("Correo electrónico"), "test@test.com")
    await user.type(screen.getByLabelText("Contraseña"), "password123")
    await user.type(screen.getByLabelText("Confirmar contraseña"), "differentpassword")
    await user.click(screen.getByLabelText(/acepto los términos/i))
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByText("Las contraseñas no coinciden")).toBeInTheDocument()
    })
  })

  it("should show error for short password", async () => {
    const user = userEvent.setup()
    render(<RegisterPageWithProvider />)

    await user.type(screen.getByLabelText("Nombre de usuario"), "testuser")
    await user.type(screen.getByLabelText("Correo electrónico"), "test@test.com")
    await user.type(screen.getByLabelText("Contraseña"), "123")
    await user.type(screen.getByLabelText("Confirmar contraseña"), "123")
    await user.click(screen.getByLabelText(/acepto los términos/i))
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByText("La contraseña debe tener al menos 6 caracteres")).toBeInTheDocument()
    })
  })

  it("should show error when terms are not accepted", async () => {
    const user = userEvent.setup()
    render(<RegisterPageWithProvider />)

    await user.type(screen.getByLabelText("Nombre de usuario"), "testuser")
    await user.type(screen.getByLabelText("Correo electrónico"), "test@test.com")
    await user.type(screen.getByLabelText("Contraseña"), "password123")
    await user.type(screen.getByLabelText("Confirmar contraseña"), "password123")
    // Don't check terms checkbox
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByText("Debes aceptar los términos y condiciones")).toBeInTheDocument()
    })
  })

  it("should register successfully with valid data", async () => {
    const user = userEvent.setup()
    render(<RegisterPageWithProvider />)

    await user.type(screen.getByLabelText("Nombre de usuario"), "newuser")
    await user.type(screen.getByLabelText("Correo electrónico"), "newuser@test.com")
    await user.type(screen.getByLabelText("Contraseña"), "password123")
    await user.type(screen.getByLabelText("Confirmar contraseña"), "password123")
    await user.click(screen.getByLabelText(/acepto los términos/i))
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

    await waitFor(
      () => {
        expect(screen.getByText("¡Registro Exitoso!")).toBeInTheDocument()
      },
      { timeout: 3000 },
    )

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/login")
      },
      { timeout: 5000 },
    )
  })

  it("should show error for duplicate username", async () => {
    const user = userEvent.setup()
    render(<RegisterPageWithProvider />)

    await user.type(screen.getByLabelText("Nombre de usuario"), "admin")
    await user.type(screen.getByLabelText("Correo electrónico"), "newemail@test.com")
    await user.type(screen.getByLabelText("Contraseña"), "password123")
    await user.type(screen.getByLabelText("Confirmar contraseña"), "password123")
    await user.click(screen.getByLabelText(/acepto los términos/i))
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

    await waitFor(
      () => {
        expect(screen.getByText("El usuario o email ya existe")).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  })

  it("should toggle password visibility", async () => {
    const user = userEvent.setup()
    render(<RegisterPageWithProvider />)

    const passwordInput = screen.getByLabelText("Contraseña")
    const confirmPasswordInput = screen.getByLabelText("Confirmar contraseña")
    const toggleButtons = screen.getAllByRole("button", { name: "" })

    expect(passwordInput).toHaveAttribute("type", "password")
    expect(confirmPasswordInput).toHaveAttribute("type", "password")

    // Toggle first password field
    await user.click(toggleButtons[0])
    expect(passwordInput).toHaveAttribute("type", "text")

    // Toggle second password field
    await user.click(toggleButtons[1])
    expect(confirmPasswordInput).toHaveAttribute("type", "text")
  })
})
