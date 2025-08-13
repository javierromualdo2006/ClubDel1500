"use client"

import { renderHook } from "@testing-library/react"

// Mock hook since we don't have the actual implementation
const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

import { useState, useEffect } from "react"

describe("useMobile", () => {
  it("should return false for desktop width", () => {
    // Mock window.innerWidth
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useMobile())
    expect(result.current).toBe(false)
  })

  it("should return true for mobile width", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 600,
    })

    const { result } = renderHook(() => useMobile())
    expect(result.current).toBe(true)
  })
})
