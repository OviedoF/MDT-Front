"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaSignOutAlt } from "react-icons/fa"

interface Project {
  id: number
  name: string
}

interface HourStatus {
  status: "worked" | "rested" | "not-worked"
}

type DaySchedule = HourStatus[]

interface ProjectSchedule {
  [date: string]: DaySchedule
}

const initialProjects: Project[] = [
  { id: 1, name: "Proyecto A" },
  { id: 2, name: "Proyecto B" },
  { id: 3, name: "Proyecto C" },
]

const generateRandomSchedule = (): DaySchedule => {
  return Array.from({ length: 24 }, () => {
    const random = Math.random()
    if (random < 0.6) return { status: "worked" }
    if (random < 0.8) return { status: "rested" }
    return { status: "not-worked" }
  })
}

const generateProjectSchedule = (): ProjectSchedule => {
  const schedule: ProjectSchedule = {}
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    schedule[date.toISOString().split("T")[0]] = generateRandomSchedule()
  }
  return schedule
}

export default function ProjectCalendarPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [selectedProject, setSelectedProject] = useState<number>(0)
  const [projectSchedule, setProjectSchedule] = useState<ProjectSchedule>({})
  const router = useRouter()

  useEffect(() => {
    if (selectedProject !== 0) {
      setProjectSchedule(generateProjectSchedule())
    }
  }, [selectedProject])

  const getStatusColor = (status: HourStatus["status"]) => {
    switch (status) {
      case "worked":
        return "bg-green-500"
      case "rested":
        return "bg-yellow-500"
      case "not-worked":
        return "bg-red-500"
      default:
        return "bg-gray-200"
    }
  }

  return (
    <main className="bg-violet-100 w-full min-h-screen">
      <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Calendario de Proyecto</h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center bg-violet-700 hover:bg-violet-800 px-4 py-2 rounded-md transition duration-300"
        >
          <FaSignOutAlt className="mr-2" />
          Dashboard
        </button>
      </header>

      <section className="p-4">
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Proyecto
          </label>
          <select
            id="project"
            value={selectedProject}
            onChange={(e) => setSelectedProject(Number(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value={0}>Selecciona un proyecto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {selectedProject !== 0 && (
          <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Fecha</th>
                  {Array.from({ length: 24 }, (_, i) => (
                    <th key={i} className="px-4 py-2 border">
                      {i.toString().padStart(2, "0")}:00
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(projectSchedule).map(([date, schedule]) => (
                  <tr key={date}>
                    <td className="px-4 py-2 border font-medium">{date}</td>
                    {schedule.map((hour, index) => (
                      <td key={index} className={`px-4 py-2 border ${getStatusColor(hour.status)}`}>
                        &nbsp;
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedProject !== 0 && (
          <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">Leyenda</h2>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 mr-2"></div>
                <span>Trabajado</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
                <span>Descansado</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 mr-2"></div>
                <span>No Trabajado</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}