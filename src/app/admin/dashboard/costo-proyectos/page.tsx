"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaSignOutAlt, FaDollarSign, FaCalendarAlt, FaClock } from "react-icons/fa"
import { makeQuery } from "@/app/utils/api"
import { useSnackbar } from "notistack"

interface Project {
  _id: string
  projectName: string
  monthlyCost: string
  dailyCost: string
  extraHourCost: string
  infoProcessRate: string
}

export default function ProjectCostsPage() {
  const router = useRouter()
  const [selectedProjectId, setSelectedProjectId] = useState<string | "">("")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [projects, setProjects] = useState<Project[]>([])
  const { enqueueSnackbar } = useSnackbar()

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
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  const getProjects = () => {
    makeQuery(
      localStorage.getItem("token"),
      "getProjectCosts",
      {
        year: selectedYear,
        month: selectedMonth,
      },
      enqueueSnackbar,
      (response) => {
        setProjects(response)
      },
      setLoading,
      () => { }
    )
  }

  useEffect(() => {
    getProjects()
  }, [selectedYear, selectedMonth])

  useEffect(() => {
    if (selectedProjectId !== "") {
      const project = projects.find((p) => p._id === selectedProjectId)
      setSelectedProject(project || null)
    } else {
      setSelectedProject(null)
    }
    console.log("Selected Project:", selectedProjectId)
  }, [selectedProjectId])

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
              <label translate="no" htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                Mes
              </label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full md:w-40 p-2 border rounded"
              >
                {months.map((month, index) => (
                  <option key={month} value={index} translate="no">
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Seleccionar Proyecto</h2>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Seleccione un proyecto</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.projectName}
              </option>
            ))}
          </select>
        </div>

        {selectedProject && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Detalles de Costos: {selectedProject.projectName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-100 p-4 rounded-lg">
                <FaDollarSign className="text-blue-500 text-3xl mb-2" />
                <h3 className="text-lg font-semibold">Costo Mensual</h3>
                <p className="text-2xl font-bold">{selectedProject.monthlyCost}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <FaCalendarAlt className="text-green-500 text-3xl mb-2" />
                <h3 className="text-lg font-semibold">Costo Diario</h3>
                <p className="text-2xl font-bold">{selectedProject.dailyCost}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg">
                <FaClock className="text-yellow-500 text-3xl mb-2" />
                <h3 className="text-lg font-semibold">Costo Hora Extra</h3>
                <p className="text-2xl font-bold">{selectedProject.extraHourCost}</p>
              </div>

              <div className="bg-red-100 p-4 rounded-lg">
                <FaDollarSign className="text-red-500 text-3xl mb-2" />
                <h3 className="text-lg font-semibold">Costo Procesamiento de Información</h3>
                <p className="text-2xl font-bold">{selectedProject.infoProcessRate}</p>
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
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Costo procesamiento de la información
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{project.projectName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{project.monthlyCost}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{project.dailyCost}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{project.extraHourCost}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{project.infoProcessRate}</td>
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

