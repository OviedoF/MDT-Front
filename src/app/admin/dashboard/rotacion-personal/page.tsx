"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaSignOutAlt } from "react-icons/fa"
import { makeQuery } from "@/app/utils/api"
import { useSnackbar } from "notistack"

interface User {
  _id: number
  name: string
  total: string
  projects: Project[]
}

interface Project {
  _id: number
  project: string
  totalHours: string
  averageDaily: string
  extraHours: string
  costPerHour: string
}

export default function CollaboratorProjectsPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])

  // Añadir estados para el mes y año seleccionados
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const { enqueueSnackbar } = useSnackbar()

  // Generar arrays para los selectores
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
  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - 1 + i)

  useEffect(() => {
    const token = localStorage.getItem("token");
    makeQuery(
      token,
      "personalRotation",
      {
        month: selectedMonth + 1,
        year: selectedYear,
      },
      enqueueSnackbar,
      (data) => setUsers(data),
    );
  }, [selectedMonth, selectedYear]);

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
        {/* Añadir selector de mes y año */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <div className="flex flex-wrap gap-4">
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
          </div>
        </div>

        {users.map((user) => (
          <div key={user._id} className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">
              {user.name} ({months[selectedMonth]} {selectedYear})
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
                  {user.projects.map((project) => {
                    return (
                      <tr key={project.project}>
                        <td className="px-6 py-4 whitespace-nowrap">{project?.project}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{project.totalHours}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{project.averageDaily}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{project.extraHours}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{project.costPerHour}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100">
                    <td className="px-6 py-4 whitespace-nowrap font-bold">Total</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold">{user.total}</td>
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
