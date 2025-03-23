"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaSignOutAlt } from "react-icons/fa"

interface User {
  id: number
  name: string
  role: "colaborador" | "topografo"
}

interface Project {
  id: number
  name: string
  hourlyRate: number
}

interface WorkEntry {
  userId: number
  projectId: number
  date: Date
  regularHours: number
  overtimeHours: number
}

const users: User[] = [
  { id: 1, name: "Juan Pérez", role: "colaborador" },
  { id: 2, name: "María García", role: "topografo" },
  { id: 3, name: "Carlos López", role: "colaborador" },
  { id: 4, name: "Ana Rodríguez", role: "topografo" },
]

const projects: Project[] = [
  { id: 1, name: "Proyecto A", hourlyRate: 25 },
  { id: 2, name: "Proyecto B", hourlyRate: 30 },
  { id: 3, name: "Proyecto C", hourlyRate: 28 },
]

// Generar datos de ejemplo para los últimos 28 días
const generateWorkEntries = (): WorkEntry[] => {
  const entries: WorkEntry[] = []
  const now = new Date()
  for (let i = 0; i < 28; i++) {
    users.forEach((user) => {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      const projectId = Math.floor(Math.random() * projects.length) + 1
      const regularHours = Math.floor(Math.random() * 8) + 1 // 1-8 horas regulares por día
      const overtimeHours = Math.random() > 0.7 ? Math.floor(Math.random() * 4) : 0 // 0-3 horas extra algunos días
      entries.push({ userId: user.id, projectId, date, regularHours, overtimeHours })
    })
  }
  return entries
}

const workEntries = generateWorkEntries()

export default function CollaboratorProjectsPage() {
  const router = useRouter()
  const [userProjects, setUserProjects] = useState<{
    [key: number]: { [key: number]: { total: number; daily: number; overtime: number } }
  }>({})

  useEffect(() => {
    const calculateUserProjects = () => {
      const result: { [key: number]: { [key: number]: { total: number; daily: number; overtime: number } } } = {}
      const twentyEightDaysAgo = new Date()
      twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28)

      workEntries.forEach((entry) => {
        if (entry.date >= twentyEightDaysAgo) {
          if (!result[entry.userId]) {
            result[entry.userId] = {}
          }
          if (!result[entry.userId][entry.projectId]) {
            result[entry.userId][entry.projectId] = { total: 0, daily: 0, overtime: 0 }
          }
          result[entry.userId][entry.projectId].total += entry.regularHours + entry.overtimeHours
          result[entry.userId][entry.projectId].daily += entry.regularHours
          result[entry.userId][entry.projectId].overtime += entry.overtimeHours
        }
      })

      setUserProjects(result)
    }

    calculateUserProjects()
  }, [])

  const getTotalHours = (userId: number) => {
    return Object.values(userProjects[userId] || {}).reduce((sum, hours) => sum + hours.total, 0)
  }

  const formatHours = (hours: number) => {
    return parseInt((hours / 28).toFixed(2)) // Promedio diario en los últimos 28 días
  }

  return (
    <main className="bg-violet-100 w-full min-h-screen">
      <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Proyectos de Colaboradores</h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center bg-violet-700 hover:bg-violet-800 px-4 py-2 rounded-md transition duration-300"
        >
          <FaSignOutAlt className="mr-2" />
          Dashboard
        </button>
      </header>

      <section className="p-4">
        {users.map((user) => (
          <div key={user.id} className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">
              {user.name} - {user.role}
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Proyecto
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Horas Totales
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Horas Diarias (Promedio)
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Horas Extras (Promedio)
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Costo por Hora
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(userProjects[user.id] || {}).map(([projectId, hours]) => {
                    const project = projects.find((p) => p.id === Number.parseInt(projectId))
                    return (
                      <tr key={projectId}>
                        <td className="px-6 py-4 whitespace-nowrap">{project?.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{hours.total} horas</td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatHours(hours.daily)} horas</td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatHours(hours.overtime)} horas</td>
                        <td className="px-6 py-4 whitespace-nowrap">${project?.hourlyRate.toFixed(2)}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100">
                    <td className="px-6 py-4 whitespace-nowrap font-bold">Total</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold">{getTotalHours(user.id)} horas</td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}

