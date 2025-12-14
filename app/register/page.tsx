"use client"

import type React from "react"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Logo from "@/components/common/Logo"
import RegisterForm from "@/components/auth/RegisterForm"

export default function Register() {



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Logo size="medium" href="/" />
          </div>
          <CardTitle className="text-2xl text-center font-bold">Crear Cuenta</CardTitle>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Ingresa tus datos para registrarte en el sistema
          </p>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
              Iniciar Sesión
            </Link>
          </div>
          <div className="text-center text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
              Volver al Inicio
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
