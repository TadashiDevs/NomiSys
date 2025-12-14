"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/auth/use-auth"
import { useToastNotifications } from "@/context/ToastNotificationContext"
import { contratosApi } from "@/services/api/contratos"

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToastNotifications();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);

      // Verificar contratos por vencer al iniciar sesión
      try {
        // Usar la API de contratos en lugar de fetch directo
        const contratos = await contratosApi.getAll();

        // Filtrar contratos a plazo fijo activos que vencen en los próximos 30 días
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const expiringContracts = contratos.filter(contract => {
          // Solo contratos a plazo fijo y activos
          if ((contract.type !== 'Plazo Fijo' && contract.tipo !== 'Plazo Fijo') ||
              (contract.status !== 'Activo' && contract.estado !== 'Activo')) {
            return false;
          }

          // Obtener la fecha de fin del contrato
          const endDateStr = contract.endDate || contract.fecha_fin;
          if (!endDateStr) return false;

          // Convertir la fecha de fin a objeto Date
          let endDate;

          // Si la fecha tiene formato dd/mm/yyyy
          if (endDateStr.includes('/')) {
            const [day, month, year] = endDateStr.split('/').map(Number);
            endDate = new Date(year, month - 1, day);
          }
          // Si la fecha tiene formato ISO
          else if (endDateStr.includes('-')) {
            endDate = new Date(endDateStr);
          }
          // Si no se puede parsear la fecha
          else {
            return false;
          }

          // Verificar si el contrato vence en los próximos 30 días
          return endDate >= today && endDate <= thirtyDaysFromNow;
        });

        // Mostrar notificación si hay contratos por vencer
        if (expiringContracts.length > 0) {
          // Agrupar contratos por días restantes
          const contractsByDays = {};

          expiringContracts.forEach(contract => {
            const endDateStr = contract.endDate || contract.fecha_fin;
            if (!endDateStr) return;

            let endDate;
            if (endDateStr.includes('/')) {
              const [day, month, year] = endDateStr.split('/').map(Number);
              endDate = new Date(year, month - 1, day);
            } else if (endDateStr.includes('-')) {
              endDate = new Date(endDateStr);
            } else {
              return;
            }

            const diasRestantes = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (!contractsByDays[diasRestantes]) {
              contractsByDays[diasRestantes] = 0;
            }

            contractsByDays[diasRestantes]++;
          });

          // Crear mensaje detallado
          const message = Object.entries(contractsByDays)
            .sort(([daysA], [daysB]) => Number(daysA) - Number(daysB))
            .map(([days, count]) => {
              const daysNum = Number(days);
              return `${count} contrato${Number(count) > 1 ? 's' : ''} vence${Number(count) > 1 ? 'n' : ''} en ${daysNum} día${daysNum !== 1 ? 's' : ''}.`;
            })
            .join('\n');

          // Guardar la información para mostrarla después de la redirección
          localStorage.setItem('showContractNotification', 'true');
          localStorage.setItem('contractNotificationMessage', message);

          // Siempre mostrar en el panel de notificaciones
          localStorage.setItem('addToNotificationPanel', 'true');

          // Imprimir en consola para debugging
          console.log('Información de contratos por vencer guardada:', {
            showNotification: true,
            message,
            addToPanel: true
          });
        }
      } catch (error) {
        console.error('Error al verificar contratos por vencer:', error);
      }

      router.push("/dashboard");
    } catch (error) {
      setError("Correo o contraseña incorrectos, intenta nuevamente.");
      setIsLoading(false);
    }
  }

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Correo electrónico
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium">
            Contraseña
          </Label>
          <Link href="#" className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full"
          />
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded"
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </motion.div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading || !isFormValid}>
        {isLoading ? "Ingresando..." : "Ingresar"}
      </Button>
    </form>
  );
}
