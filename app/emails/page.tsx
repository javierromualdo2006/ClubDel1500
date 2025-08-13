import { Header } from "@/components/header"
import { EmailsPage } from "@/components/emails-page"

export default function EmailsPageRoute() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <EmailsPage />
    </div>
  )
}
