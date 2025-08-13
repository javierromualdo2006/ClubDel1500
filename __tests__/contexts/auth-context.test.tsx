"use client"

import { renderHook, act } from "@testing-library/react"
import type { ReactNode } from "react"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import jest from "jest" // Import jest to fix the undeclared variable error

// Wrapper para el provider
const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>

describe("AuthContext", () => {
  describe("Initial State", () => {
    it("should have no current user initially", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.currentUser).toBeNull()
    })

    it("should have default users", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.users).toHaveLength(4)
      expect(result.current.users[0].username).toBe("admin")
      expect(result.current.users[0].role).toBe("admin")
    })

    it("should not be admin initially", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.isAdmin()).toBe(false)
    })
  })

  describe("Login Function", () => {
    it("should login admin with correct credentials", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      act(() => {
        const success = result.current.login("admin", "123")
        expect(success).toBe(true)
      })

      expect(result.current.currentUser?.username).toBe("admin")
      expect(result.current.currentUser?.role).toBe("admin")
      expect(result.current.isAdmin()).toBe(true)
    })

    it("should not login admin with wrong password", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      act(() => {
        const success = result.current.login("admin", "wrongpassword")
        expect(success).toBe(false)
      })

      expect(result.current.currentUser).toBeNull()
    })

    it("should login regular user with any password", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      act(() => {
        const success = result.current.login("usuario", "anypassword")
        expect(success).toBe(true)
      })

      expect(result.current.currentUser?.username).toBe("usuario")
      expect(result.current.currentUser?.role).toBe("user")
      expect(result.current.isAdmin()).toBe(false)
    })

    it("should not login inactive user", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      act(() => {
        const success = result.current.login("maria", "anypassword")
        expect(success).toBe(false)
      })

      expect(result.current.currentUser).toBeNull()
    })

    it("should not login non-existent user", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      act(() => {
        const success = result.current.login("nonexistent", "password")
        expect(success).toBe(false)
      })

      expect(result.current.currentUser).toBeNull()
    })
  })

  describe("Register Function", () => {
    it("should register new user successfully", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      const newUserData = {
        username: "newuser",
        email: "newuser@test.com",
        password: "password123",
        emailNotifications: true,
      }

      act(() => {
        const success = result.current.register(newUserData)
        expect(success).toBe(true)
      })

      const newUser = result.current.users.find((u) => u.username === "newuser")
      expect(newUser).toBeDefined()
      expect(newUser?.email).toBe("newuser@test.com")
      expect(newUser?.role).toBe("user")
      expect(newUser?.isActive).toBe(true)
      expect(newUser?.emailNotifications).toBe(true)
    })

    it("should not register user with existing username", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      const duplicateUserData = {
        username: "admin",
        email: "newemail@test.com",
        password: "password123",
        emailNotifications: false,
      }

      act(() => {
        const success = result.current.register(duplicateUserData)
        expect(success).toBe(false)
      })

      // Should still have only 4 users
      expect(result.current.users).toHaveLength(4)
    })

    it("should not register user with existing email", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      const duplicateEmailData = {
        username: "newusername",
        email: "admin@sistema.com",
        password: "password123",
        emailNotifications: false,
      }

      act(() => {
        const success = result.current.register(duplicateEmailData)
        expect(success).toBe(false)
      })

      expect(result.current.users).toHaveLength(4)
    })
  })

  describe("Logout Function", () => {
    it("should logout current user", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      // First login
      act(() => {
        result.current.login("admin", "123")
      })

      expect(result.current.currentUser).not.toBeNull()

      // Then logout
      act(() => {
        result.current.logout()
      })

      expect(result.current.currentUser).toBeNull()
      expect(result.current.isAdmin()).toBe(false)
    })
  })

  describe("User Management Functions", () => {
    it("should update user role", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      const userToUpdate = result.current.users.find((u) => u.username === "usuario")
      expect(userToUpdate?.role).toBe("user")

      act(() => {
        result.current.updateUserRole(userToUpdate!.id, "admin")
      })

      const updatedUser = result.current.users.find((u) => u.username === "usuario")
      expect(updatedUser?.role).toBe("admin")
    })

    it("should toggle user status", () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      const userToToggle = result.current.users.find((u) => u.username === "usuario")
      const initialStatus = userToToggle?.isActive

      act(() => {
        result.current.toggleUserStatus(userToToggle!.id)
      })

      const toggledUser = result.current.users.find((u) => u.username === "usuario")
      expect(toggledUser?.isActive).toBe(!initialStatus)
    })
  })

  describe("Error Handling", () => {
    it("should throw error when useAuth is used outside provider", () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})

      expect(() => {
        renderHook(() => useAuth())
      }).toThrow("useAuth must be used within an AuthProvider")

      consoleSpy.mockRestore()
    })
  })
})
