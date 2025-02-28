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
}

interface WorkEntry {
  userId: number
  projectId: number
  date: Date
  hours: number
}

const users: User[] = [
  { id: 1, name: "Juan Pérez", role: "colaborador" },
  { id: 2, name: "María García", role: "topografo" },
  { id: 3, name: "Carlos López", role: "colaborador" },
  { id: 4, name: "Ana Rodríguez", role: "topografo" },
]

const projects: Project[] = [
  { id: 1, name: "Proyecto A" },
  { id: 2, name: "Proyecto B" },
  { id: 3, name: "Proyecto C" },
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
      const hours = Math.floor(Math.random() * 8) + 1 // 1-8 horas por día
      entries.push({ userId: user.id, projectId, date, hours })
    })
  }
  return entries
}

const workEntries = generateWorkEntries()

export default function CollaboratorProjectsPage() {
  const router = useRouter()
  const [userProjects, setUserProjects] = useState<{ [key: number]: { [key: number]: number } }>({})

  useEffect(() => {
    const calculateUserProjects = () => {
      const result: { [key: number]: { [key: number]: number } } = {}
      const twentyEightDaysAgo = new Date()
      twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28)

      workEntries.forEach((entry) => {
        if (entry.date >= twentyEightDaysAgo) {
          if (!result[entry.userId]) {
            result[entry.userId] = {}
          }
          if (!result[entry.userId][entry.projectId]) {
            result[entry.userId][entry.projectId] = 0
          }
          result[entry.userId][entry.projectId] += entry.hours
        }
      })

      setUserProjects(result)
    }

    calculateUserProjects()
  }, [])

  const getTotalHours = (userId: number) => {
    return Object.values(userProjects[userId] || {}).reduce((sum, hours) => sum + hours, 0)
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
                      Horas Acumuladas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(userProjects[user.id] || {}).map(([projectId, hours]) => (
                    <tr key={projectId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {projects.find((p) => p.id === Number.parseInt(projectId))?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{hours} horas</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100">
                    <td className="px-6 py-4 whitespace-nowrap font-bold">Total</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold">{getTotalHours(user.id)} horas</td>
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

