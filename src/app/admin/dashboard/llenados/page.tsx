"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaSignOutAlt, FaExclamationTriangle, FaEdit, FaChevronDown, FaChevronUp } from "react-icons/fa"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Project {
  id: number
  name: string
}

interface User {
  id: number
  name: string
}

interface MissingEntry {
  date: Date
  users: User[]
}

interface ProjectMissingHours {
  project: Project
  missingDays: number
  totalUsersMissing: number
  entries: MissingEntry[]
}

const projects: Project[] = [
  { id: 1, name: "Proyecto A" },
  { id: 2, name: "Proyecto B" },
  { id: 3, name: "Proyecto C" },
]

const users: User[] = [
  { id: 1, name: "Juan Pérez" },
  { id: 2, name: "María García" },
  { id: 3, name: "Carlos López" },
  { id: 4, name: "Ana Rodríguez" },
]

// Función para generar datos de ejemplo
const generateMissingHoursData = (): ProjectMissingHours[] => {
  return projects.map((project) => {
    const missingDays = Math.floor(Math.random() * 10) + 1
    const entries: MissingEntry[] = Array.from({ length: missingDays }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i - 1)
      const missingUsers = users.filter(() => Math.random() > 0.5)
      return { date, users: missingUsers }
    })
    return {
      project,
      missingDays,
      totalUsersMissing: [...new Set(entries.flatMap((e) => e.users))].length,
      entries,
    }
  })
}

export default function MissingHoursPage() {
  const router = useRouter()
  const [projectsData, setProjectsData] = useState<ProjectMissingHours[]>([])
  const [expandedProject, setExpandedProject] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    setProjectsData(generateMissingHoursData())
  }, [])

  const toggleProjectExpansion = (projectId: number) => {
    setExpandedProject(expandedProject === projectId ? null : projectId)
    setSelectedDate(null)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const handleEditClick = (user: User) => {
    setEditingUser(user)
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Aquí iría la lógica para guardar las horas editadas
    setIsEditModalOpen(false)
    setEditingUser(null)
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
        {projectsData.map((projectData) => (
          <div key={projectData.project.id} className="bg-white p-6 rounded-lg shadow-md mb-4">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleProjectExpansion(projectData.project.id)}
            >
              <h2 className="text-xl font-bold">{projectData.project.name}</h2>
              <div className="flex items-center">
                <span className="mr-4">
                  <FaExclamationTriangle className="text-yellow-500 mr-2 inline" />
                  {projectData.missingDays} días sin registrar
                </span>
                <span className="mr-4">{projectData.totalUsersMissing} usuarios afectados</span>
                {expandedProject === projectData.project.id ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>

            {expandedProject === projectData.project.id && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Días sin registro:</h3>
                <div className="grid grid-cols-7 gap-2">
                  {projectData.entries.map((entry, index) => (
                    <div
                      key={index}
                      className={`p-2 text-center cursor-pointer ${
                        selectedDate && entry.date.getTime() === selectedDate.getTime() ? "bg-violet-200" : "bg-red-100"
                      }`}
                      onClick={() => handleDateClick(entry.date)}
                    >
                      {format(entry.date, "d MMM", { locale: es })}
                    </div>
                  ))}
                </div>

                {selectedDate && (
                  <div className="mt-4">
                    <h4 className="text-md font-semibold mb-2">
                      Usuarios sin registro el {format(selectedDate, "d MMMM yyyy", { locale: es })}:
                    </h4>
                    <ul>
                      {projectData.entries
                        .find((e) => e.date.getTime() === selectedDate.getTime())
                        ?.users.map((user) => (
                          <li key={user.id} className="flex justify-between items-center py-2">
                            <span>{user.name}</span>
                            <button
                              onClick={() => handleEditClick(user)}
                              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                            >
                              <FaEdit className="inline mr-1" /> Editar
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </section>

      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Editar horas para {editingUser.name}</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label htmlFor="hours" className="block text-sm font-medium text-gray-700">
                  Horas trabajadas
                </label>
                <input
                  type="number"
                  id="hours"
                  name="hours"
                  min="0"
                  max="24"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="mr-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Cancelar
                </button>
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}