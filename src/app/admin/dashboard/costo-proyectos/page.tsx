"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaSignOutAlt, FaDollarSign, FaCalendarAlt, FaClock } from "react-icons/fa"

interface Project {
  id: number
  name: string
  monthlyCost: number
  dailyCost: number
  overtimeHourlyCost: number
}

const projects: Project[] = [
  { id: 1, name: "Proyecto A", monthlyCost: 15000, dailyCost: 500, overtimeHourlyCost: 75 },
  { id: 2, name: "Proyecto B", monthlyCost: 22000, dailyCost: 733.33, overtimeHourlyCost: 90 },
  { id: 3, name: "Proyecto C", monthlyCost: 18000, dailyCost: 600, overtimeHourlyCost: 80 },
  { id: 4, name: "Proyecto D", monthlyCost: 30000, dailyCost: 1000, overtimeHourlyCost: 100 },
]

export default function ProjectCostsPage() {
  const router = useRouter()
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    if (selectedProjectId !== "") {
      const project = projects.find((p) => p.id === selectedProjectId)
      setSelectedProject(project || null)
    } else {
      setSelectedProject(null)
    }
  }, [selectedProjectId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount)
  }

  return (
    <main className="bg-violet-100 w-full min-h-screen">
      <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Costos de Proyectos</h1>
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
          <h2 className="text-xl font-bold mb-4">Seleccionar Proyecto</h2>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value="">Seleccione un proyecto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {selectedProject && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Detalles de Costos: {selectedProject.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-100 p-4 rounded-lg">
                <FaDollarSign className="text-blue-500 text-3xl mb-2" />
                <h3 className="text-lg font-semibold">Costo Mensual</h3>
                <p className="text-2xl font-bold">{formatCurrency(selectedProject.monthlyCost)}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <FaCalendarAlt className="text-green-500 text-3xl mb-2" />
                <h3 className="text-lg font-semibold">Costo Diario</h3>
                <p className="text-2xl font-bold">{formatCurrency(selectedProject.dailyCost)}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg">
                <FaClock className="text-yellow-500 text-3xl mb-2" />
                <h3 className="text-lg font-semibold">Costo Hora Extra</h3>
                <p className="text-2xl font-bold">{formatCurrency(selectedProject.overtimeHourlyCost)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Resumen de Todos los Proyectos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Proyecto
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Costo Mensual
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Costo Diario
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Costo Hora Extra
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{project.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(project.monthlyCost)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(project.dailyCost)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(project.overtimeHourlyCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  )
}

