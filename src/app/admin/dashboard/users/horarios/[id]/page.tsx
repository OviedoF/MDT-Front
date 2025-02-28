"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaSignOutAlt, FaClock } from "react-icons/fa"

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
  regularHours: number
  overtimeHours: number
}

const projects: Project[] = [
  { id: 1, name: "Proyecto A" },
  { id: 2, name: "Proyecto B" },
  { id: 3, name: "Proyecto C" },
]

// Generar datos de ejemplo para los últimos 30 días
const generateWorkEntries = (userId: number): WorkEntry[] => {
  const entries: WorkEntry[] = []
  const now = new Date()
  for (let i = 0; i < 30; i++) {
    const date = new Date(now)
    date.setDate(now.getDate() - i)
    const projectId = Math.floor(Math.random() * projects.length) + 1
    const regularHours = Math.floor(Math.random() * 8) + 1 // 1-8 horas regulares por día
    const overtimeHours = Math.random() > 0.7 ? Math.floor(Math.random() * 4) : 0 // 0-3 horas extra algunos días
    entries.push({ userId, projectId, date, regularHours, overtimeHours })
  }
  return entries
}

export default function UserDetailPage({ params }: any ) {
  const router = useRouter()
  const userId = Number.parseInt(params.id)
  const [user, setUser] = useState<User | null>(null)
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([])

  useEffect(() => {
    // Simular la carga de datos del usuario
    const fetchUser = async () => {
      // En una aplicación real, esto sería una llamada a la API
      const userData: User = { id: userId, name: `Usuario ${userId}`, role: "colaborador" }
      setUser(userData)
    }

    fetchUser()
    setWorkEntries(generateWorkEntries(userId))
  }, [userId])

  const calculateProjectHours = () => {
    const projectHours: { [key: number]: { regular: number; overtime: number } } = {}
    workEntries.forEach((entry) => {
      if (!projectHours[entry.projectId]) {
        projectHours[entry.projectId] = { regular: 0, overtime: 0 }
      }
      projectHours[entry.projectId].regular += entry.regularHours
      projectHours[entry.projectId].overtime += entry.overtimeHours
    })
    return projectHours
  }

  const projectHours = calculateProjectHours()

  const totalRegularHours = Object.values(projectHours).reduce((sum, hours) => sum + hours.regular, 0)
  const totalOvertimeHours = Object.values(projectHours).reduce((sum, hours) => sum + hours.overtime, 0)

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <main className="bg-violet-100 w-full min-h-screen">
      <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Detalle de Usuario: {user.name}</h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center bg-violet-700 hover:bg-violet-800 px-4 py-2 rounded-md transition duration-300"
        >
          <FaSignOutAlt className="mr-2" />
          Dashboard
        </button>
      </header>

      <section className="p-4">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Resumen de Horas Trabajadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-100 p-4 rounded-lg">
              <FaClock className="text-green-500 text-3xl mb-2" />
              <h3 className="text-lg font-semibold">Horas Regulares</h3>
              <p className="text-2xl font-bold">{totalRegularHours}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <FaClock className="text-yellow-500 text-3xl mb-2" />
              <h3 className="text-lg font-semibold">Horas Extra</h3>
              <p className="text-2xl font-bold">{totalOvertimeHours}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Detalle por Proyecto</h2>
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
                    Total Horas
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(projectHours).map(([projectId, hours]) => (
                  <tr key={projectId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {projects.find((p) => p.id === Number.parseInt(projectId))?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{hours.regular}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{hours.overtime}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold">{hours.regular + hours.overtime}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap font-bold">Total</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold">{totalRegularHours}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold">{totalOvertimeHours}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold">{totalRegularHours + totalOvertimeHours}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>
    </main>
  )
}

