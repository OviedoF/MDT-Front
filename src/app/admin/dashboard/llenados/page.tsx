"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaSignOutAlt, FaExclamationTriangle, FaChevronDown, FaChevronUp } from "react-icons/fa"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

interface ProjectMissingHours {
  projectId: string
  projectName: string
  missingDays: string[]
  usersMissingEntries: Record<string, string[]>
  totalUsersAffected: number
  totalMissingDays: number
}

export default function MissingHoursPage() {
  const router = useRouter()
  const [projectsData, setProjectsData] = useState<ProjectMissingHours[]>([])
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMissingHours = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("http://localhost:4001/api/project/unregistered")

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()
        setProjectsData(data)
        setError(null)
      } catch (err) {
        setError("Error al cargar los datos. Por favor, intente nuevamente.")
        console.error("Error fetching missing hours:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMissingHours()
  }, [])

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId)
    setSelectedDate(null)
  }

  const handleDateClick = (date: string) => {
    setSelectedDate(date)
  }

  // Get users who are missing entries for a specific date
  const getUsersForDate = (project: ProjectMissingHours, date: string) => {
    return Object.entries(project.usersMissingEntries)
      .filter(([_, dates]) => dates.includes(date))
      .map(([userName]) => userName)
  }

  if (isLoading) {
    return (
      <main className="bg-violet-100 w-full min-h-screen flex justify-center items-center">
        <div className="text-xl">Cargando datos...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="bg-violet-100 w-full min-h-screen flex justify-center items-center">
        <div className="text-xl text-red-600">{error}</div>
      </main>
    )
  }

  return (
    <main className="bg-violet-100 w-full min-h-screen">
      <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Horas No Registradas</h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center bg-violet-700 hover:bg-violet-800 px-4 py-2 rounded-md transition duration-300"
        >
          <FaSignOutAlt className="mr-2" />
          Dashboard
        </button>
      </header>

      <section className="p-4">
        {projectsData.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">No hay proyectos con horas sin registrar.</div>
        ) : (
          projectsData.map((projectData) => (
            <div key={projectData.projectId} className="bg-white p-6 rounded-lg shadow-md mb-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleProjectExpansion(projectData.projectId)}
              >
                <h2 className="text-xl font-bold">{projectData.projectName}</h2>
                <div className="flex items-center">
                  <span className="mr-4">
                    <FaExclamationTriangle className="text-yellow-500 mr-2 inline" />
                    {projectData.totalMissingDays} días sin registrar
                  </span>
                  <span className="mr-4">{projectData.totalUsersAffected} usuarios afectados</span>
                  {expandedProject === projectData.projectId ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>

              {expandedProject === projectData.projectId && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Días sin registro:</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {projectData.missingDays.map((dateStr) => (
                      <div
                        key={dateStr}
                        className={`p-2 text-center cursor-pointer ${
                          selectedDate === dateStr ? "bg-violet-200" : "bg-red-100"
                        }`}
                        onClick={() => handleDateClick(dateStr)}
                      >
                        {format(parseISO(dateStr), "d MMM", { locale: es })}
                      </div>
                    ))}
                  </div>

                  {selectedDate && (
                    <div className="mt-4">
                      <h4 className="text-md font-semibold mb-2">
                        Usuarios sin registro el {format(parseISO(selectedDate), "d MMMM yyyy", { locale: es })}:
                      </h4>
                      <ul className="divide-y">
                        {getUsersForDate(projectData, selectedDate).map((userName, index) => (
                          <li key={index} className="flex justify-between items-center py-3">
                            <span>{userName}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </main>
  )
}