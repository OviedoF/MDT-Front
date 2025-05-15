"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { FaSignOutAlt, FaClock, FaCalendarAlt } from "react-icons/fa"
import { makeQuery } from "@/app/utils/api"


interface Project {
  projectName: string
  regularHours: number
  extraHours: number
  totalHours: number
}

interface UserData {
  name: string
  regularHours: number
  extraHours: number
  totalHours: number
  projects: Project[]
}

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


export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams();
  const userId = params.id
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
  const [data, setData] = useState<UserData>(({
    name: "",
    regularHours: 0,
    extraHours: 0,
    totalHours: 0,
    projects: [
      {
        projectName: "Proyecto A",
        regularHours: 0,
        extraHours: 0,
        totalHours: 0
      },
      {
        projectName: "Proyecto B",
        regularHours: 0,
        extraHours: 0,
        totalHours: 0
      },
      {
        projectName: "Proyecto C",
        regularHours: 0,
        extraHours: 0,
        totalHours: 0
      }
    ]
  }))

  const getData = async () => {
    makeQuery(
      localStorage.getItem("token"),
      'payrollSummaryByUser',
      { userId, year: selectedYear, month: selectedMonth },
      undefined,
      (response: UserData) => {
        setData(response)
      },
      undefined,
      (error: any) => {
        console.error("Error al obtener los datos:", error)
      }
    )
  }

  useEffect(() => {
    getData()
  }, [selectedYear, selectedMonth])

  return (
    <main className="bg-violet-100 w-full min-h-screen">
      <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Detalle de Usuario: {data.name}</h1>
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

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Resumen de Horas Trabajadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-100 p-4 rounded-lg">
              <FaClock className="text-green-500 text-3xl mb-2" />
              <h3 className="text-lg font-semibold">Horas Regulares</h3>
              <p className="text-2xl font-bold">{data.regularHours}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <FaClock className="text-yellow-500 text-3xl mb-2" />
              <h3 className="text-lg font-semibold">Horas Extra</h3>
              <p className="text-2xl font-bold">{data.extraHours}</p>
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
                {data.projects.map((project) => (
                  <tr key={project.projectName}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {project.projectName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{project.regularHours}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{project.extraHours}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold">{project.totalHours}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap font-bold">Total</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold">{data.regularHours}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold">{data.extraHours}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold">{data.totalHours}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>
    </main>
  )
}

