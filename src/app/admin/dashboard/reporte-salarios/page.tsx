"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FaSignOutAlt, FaInfoCircle, FaCalendarAlt } from "react-icons/fa"

interface User {
  id: number
  name: string
  role: "colaborador" | "topografo"
  hourlyRate: number
  overtimeRate: number
}

interface Project {
  id: number
  name: string
}

interface WorkEntry {
  userId: number
  projectId: number
  date: Date
  regularHours: number
  overtimeHours: number
}

const users: User[] = [
  { id: 1, name: "Juan Pérez", role: "colaborador", hourlyRate: 15, overtimeRate: 22.5 },
  { id: 2, name: "María García", role: "topografo", hourlyRate: 20, overtimeRate: 30 },
  { id: 3, name: "Carlos López", role: "colaborador", hourlyRate: 15, overtimeRate: 22.5 },
  { id: 4, name: "Ana Rodríguez", role: "topografo", hourlyRate: 20, overtimeRate: 30 },
]

const projects: Project[] = [
  { id: 1, name: "Proyecto A" },
  { id: 2, name: "Proyecto B" },
  { id: 3, name: "Proyecto C" },
]

// Generar datos de ejemplo para el mes actual
const generateWorkEntries = (): WorkEntry[] => {
  const entries: WorkEntry[] = []
  // Generar datos para los últimos 12 meses
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  // Generar datos para los últimos 2 años
  for (let year = currentYear - 1; year <= currentYear; year++) {
    for (let month = 0; month < 12; month++) {
      // Omitir meses futuros
      if (year === currentYear && month > currentMonth) continue

      const daysInMonth = new Date(year, month + 1, 0).getDate()

      for (let day = 1; day <= daysInMonth; day++) {
        // No generar entradas para todos los días para mantener los datos manejables
        if (day % 3 !== 0) continue // Solo cada 3 días

        users.forEach((user) => {
          const projectId = Math.floor(Math.random() * projects.length) + 1
          const regularHours = Math.floor(Math.random() * 8) + 1 // 1-8 horas regulares por día
          const overtimeHours = Math.random() > 0.7 ? Math.floor(Math.random() * 4) : 0 // 0-3 horas extra algunos días
          entries.push({
            userId: user.id,
            projectId,
            date: new Date(year, month, day),
            regularHours,
            overtimeHours,
          })
        })
      }
    }
  }
  return entries
}

const workEntries = generateWorkEntries()

export default function MonthlyPayrollPage() {
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const calculateUserSummary = (userId: number) => {
    const startOfMonth = new Date(selectedYear, selectedMonth, 1)
    const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0)

    const userEntries = workEntries.filter(
      (entry) => entry.userId === userId && entry.date >= startOfMonth && entry.date <= endOfMonth,
    )

    const totalRegularHours = userEntries.reduce((sum, entry) => sum + entry.regularHours, 0)
    const totalOvertimeHours = userEntries.reduce((sum, entry) => sum + entry.overtimeHours, 0)
    const user = users.find((u) => u.id === userId)!
    const regularPay = totalRegularHours * user.hourlyRate
    const overtimePay = totalOvertimeHours * user.overtimeRate
    const totalPay = regularPay + overtimePay

    const projectSummary = userEntries.reduce(
      (acc, entry) => {
        if (!acc[entry.projectId]) {
          acc[entry.projectId] = { regularHours: 0, overtimeHours: 0, pay: 0 }
        }
        acc[entry.projectId].regularHours += entry.regularHours
        acc[entry.projectId].overtimeHours += entry.overtimeHours
        acc[entry.projectId].pay += entry.regularHours * user.hourlyRate + entry.overtimeHours * user.overtimeRate
        return acc
      },
      {} as { [key: number]: { regularHours: number; overtimeHours: number; pay: number } },
    )

    return {
      totalRegularHours,
      totalOvertimeHours,
      regularPay,
      overtimePay,
      totalPay,
      projectSummary,
    }
  }

  const openModal = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  return (
    <main className="bg-violet-100 w-full min-h-screen">
      <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Nómina Mensual</h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center bg-violet-700 hover:bg-violet-800 px-4 py-2 rounded-md transition duration-300"
        >
          <FaSignOutAlt className="mr-2" />
          Dashboard
        </button>
      </header>

      <section className="p-4">
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaCalendarAlt className="mr-2 text-violet-600" />
            Seleccionar Período
          </h2>
          <div className="flex flex-wrap gap-4">
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Año
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full md:w-32 p-2 border rounded"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                Mes
              </label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full md:w-40 p-2 border rounded"
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">
            Resumen de Nómina - {months[selectedMonth]} {selectedYear}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Horas Regulares
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Horas Extra
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Pago Total
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Detalles
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const summary = calculateUserSummary(user.id)
                  return (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{summary.totalRegularHours}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{summary.totalOvertimeHours}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${summary.totalPay.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => openModal(user)} className="text-blue-600 hover:text-blue-900">
                          <FaInfoCircle />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">
              Detalle de {selectedUser.name} - {months[selectedMonth]} {selectedYear}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Proyecto
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Horas Regulares
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Horas Extra
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pago
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(calculateUserSummary(selectedUser.id).projectSummary).map(([projectId, data]) => (
                    <tr key={projectId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {projects.find((p) => p.id === Number.parseInt(projectId))?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{data.regularHours}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{data.overtimeHours}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${data.pay.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

