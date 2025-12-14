"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Check, X, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/auth/use-auth"

export default function RegisterForm() {
  const router = useRouter()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    acceptTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    return strength
  }

  const passwordStrength = calculatePasswordStrength(formData.password)
  const passwordStrengthText = ["Muy débil", "Débil", "Media", "Fuerte", "Muy fuerte"]
  const passwordStrengthColor = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-green-600"]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Clear errors when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El correo es requerido"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Por favor, ingresa un correo válido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres"
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Debes aceptar los términos y condiciones para continuar"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      await register(formData.name, formData.email, formData.password)
      router.push("/login")
    } catch (error) {
      setErrors({ form: "Error al registrar usuario. Intenta nuevamente." })
      setIsLoading(false)
    }
  }

  const isFormValid =
    formData.name.trim() !== "" &&
    validateEmail(formData.email) &&
    formData.password.length >= 8 &&
    formData.acceptTerms

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Nombre completo
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Juan Pérez"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Correo electrónico
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="correo@ejemplo.com"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? "border-red-500 pr-10" : "pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {formData.password && (
          <div className="mt-2 space-y-2">
            <div className="flex gap-1 h-1.5">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`h-full flex-1 rounded-full ${
                    index < passwordStrength
                      ? passwordStrengthColor[passwordStrength - 1]
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {passwordStrength > 0 ? passwordStrengthText[passwordStrength - 1] : "Ingresa una contraseña"}
            </p>
          </div>
        )}

        {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}

        <div className="space-y-1 mt-1">
          <div className="flex items-center gap-2 text-xs">
            {formData.password.length >= 8 ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <X size={14} className="text-gray-400" />
            )}
            <span className={formData.password.length >= 8 ? "text-green-500" : "text-gray-500"}>
              Mínimo 8 caracteres
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-start space-x-2 pt-2">
        <Checkbox
          id="terms"
          name="acceptTerms"
          checked={formData.acceptTerms}
          onCheckedChange={(checked) =>
            setFormData({
              ...formData,
              acceptTerms: checked as boolean,
            })
          }
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Acepto los{" "}
            <Link href="#" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
              términos y condiciones
            </Link>
          </Label>
          {errors.acceptTerms && <p className="text-sm text-red-500">{errors.acceptTerms}</p>}
        </div>
      </div>

      {errors.form && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded"
        >
          <AlertCircle size={16} />
          <span>{errors.form}</span>
        </motion.div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading || !isFormValid}>
        {isLoading ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  )
}
