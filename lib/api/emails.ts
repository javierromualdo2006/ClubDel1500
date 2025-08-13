export interface EmailRecipient {
  email: string
  name: string
}

export interface SendEmailRequest {
  subject: string
  message: string
  recipients: EmailRecipient[]
}

export interface SendEmailResponse {
  success: boolean
  message: string
  results?: {
    successful: number
    failed: number
    total: number
    details: Array<{
      success: boolean
      recipient: string
      data?: any
      error?: string
    }>
  }
  error?: string
}

export async function sendMassEmail(data: SendEmailRequest): Promise<SendEmailResponse> {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      let errorMessage = "Failed to send emails"

      try {
        // Check if response is JSON
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } else {
          // If not JSON, get text response
          const errorText = await response.text()
          errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`
        }
      } catch (parseError) {
        // If parsing fails, use status text
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
      }

      throw new Error(errorMessage)
    }

    try {
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return await response.json()
      } else {
        throw new Error("Server returned non-JSON response")
      }
    } catch (parseError) {
      throw new Error("Failed to parse server response")
    }
  } catch (error) {
    console.error("Error sending mass email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
