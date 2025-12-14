"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { authApi } from "@/services/api"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un usuario en localStorage al cargar la página
    const currentUser = authApi.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const user = await authApi.login({ email, password })
      setUser(user)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      authApi.logout()
      setUser(null)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      throw new Error("Error al cerrar sesión")
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      await authApi.register({ name, email, password })
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
