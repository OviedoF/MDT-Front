"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FaSignOutAlt, FaEnvelope, FaProjectDiagram, FaPaperPlane, FaCalendarAlt } from "react-icons/fa"
import { useSnackbar } from "notistack"
import { makeQuery } from "@/app/utils/api"

interface Project {
  _id: string
  name: string
  alias: string
}

export default function SendProjectEmailPage() {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [email, setEmail] = useState("")
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("")
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const months = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ]

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push({ value: i.toString(), label: i.toString() })
    }
    return years
  }

  const years = generateYearOptions()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || selectedProjectId === "" || !selectedMonth || !selectedYear) {
      enqueueSnackbar("Por favor, complete todos los campos", { variant: "warning" })
      return
    }

    makeQuery(
      localStorage.getItem("token"),
      "sendMail",
      {
        email,
        projectId: selectedProjectId,
        month: selectedMonth,
        year: selectedYear,
      },
      enqueueSnackbar,
      (response) => {
        enqueueSnackbar("Email enviado con éxito", { variant: "success" })
        setEmail("")
        setSelectedProjectId("")
        setSelectedMonth("")
        setSelectedYear("")
      },
      setIsLoading,
      () => {},
    )
  }

  const getProjects = () => {
    makeQuery(
      localStorage.getItem("token"),
      "getProjects",
      {},
      enqueueSnackbar,
      (response) => {
        setProjects(response)
      },
      setIsLoading,
      () => {},
    )
  }

  useEffect(() => {
    getProjects()
  }, [])

  return (
    <main className="bg-violet-100 w-full min-h-screen">
      <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Enviar Email de Proyecto</h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center bg-violet-700 hover:bg-violet-800 px-4 py-2 rounded-md transition duration-300"
        >
          <FaSignOutAlt className="mr-2" />
          Dashboard
        </button>
      </header>

      <section className="p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">Enviar Información del Proyecto</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full p-2 border rounded focus:ring-violet-500 focus:border-violet-500"
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
                Proyecto
              </label>
              <div className="relative">
                <FaProjectDiagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  id="project"
                  value={selectedProjectId}
                  onChange={(e: any) => setSelectedProjectId(e.target.value)}
                  className="pl-10 w-full p-2 border rounded focus:ring-violet-500 focus:border-violet-500"
                  required
                >
                  <option value="">Seleccione un proyecto</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.alias}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                  Mes
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    id="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="pl-10 w-full p-2 border rounded focus:ring-violet-500 focus:border-violet-500"
                    required
                  >
                    <option value="">Seleccione mes</option>
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Año
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    id="year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="pl-10 w-full p-2 border rounded focus:ring-violet-500 focus:border-violet-500"
                    required
                  >
                    <option value="">Seleccione año</option>
                    {years.map((year) => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className={`w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <FaPaperPlane className="mr-2" />
              )}
              {isLoading ? "Enviando..." : "Enviar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}