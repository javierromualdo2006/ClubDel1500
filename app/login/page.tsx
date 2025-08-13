import { Header } from "@/components/header"
import { LoginPage } from "@/components/login-page"

export default function LoginPageRoute() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <LoginPage />
    </div>
  )
}
