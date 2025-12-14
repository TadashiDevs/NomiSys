"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/services/api"

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar si el usuario está autenticado al cargar el componente
    const checkAuth = () => {
      if (authApi.isAuthenticated()) {
        setUser(authApi.getCurrentUser())
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const user = await authApi.login({ email, password })
      setUser(user)
      return user
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    authApi.logout()
    setUser(null)
    router.push("/login")
  }

  const requireAuth = (callback?: () => void) => {
    if (!authApi.isAuthenticated()) {
      router.push("/login")
    } else if (callback) {
      callback()
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login: handleLogin,
    logout: handleLogout,
    requireAuth,
  }
}
