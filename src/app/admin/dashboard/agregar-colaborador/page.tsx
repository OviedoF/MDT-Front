"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSnackbar } from "notistack"
import { FaUserPlus, FaSignOutAlt } from "react-icons/fa"

interface User {
  id: number
  name: string
  role: "supervisor" | "colaborador"
}

interface Project {
  id: number
  name: string
  description: string
  supervisor: number
  collaborators: number[]
}

const initialUsers: User[] = [
  { id: 1, name: "Juan Pérez", role: "supervisor" },
  { id: 2, name: "María García", role: "colaborador" },
  { id: 3, name: "Carlos López", role: "colaborador" },
  { id: 4, name: "Ana Rodríguez", role: "colaborador" },
]

const initialProjects: Project[] = [
  { id: 1, name: "Proyecto A", description: "Descripción del Proyecto A", supervisor: 1, collaborators: [2] },
  { id: 2, name: "Proyecto B", description: "Descripción del Proyecto B", supervisor: 1, collaborators: [3] },
]

export default function AddCollaboratorPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [selectedUser, setSelectedUser] = useState<number>(0)
  const [selectedProject, setSelectedProject] = useState<number>(0)
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  const [availableCollaborators, setAvailableCollaborators] = useState<User[]>([])

  useEffect(() => {
    // Filter out users who are already collaborators or are supervisors
    const availableUsers = users.filter(
      (user) =>
        user.role === "colaborador" &&
        !projects.find((project) => project.id === selectedProject)?.collaborators.includes(user.id),
    )
    setAvailableCollaborators(availableUsers)
  }, [selectedProject, users, projects])

  const handleAddCollaborator = () => {
    if (selectedUser === 0 || selectedProject === 0) {
      enqueueSnackbar("Por favor, selecciona un colaborador y un proyecto", { variant: "warning" })
      return
    }

    const updatedProjects = projects.map((project) => {
      if (project.id === selectedProject) {
        return {
          ...project,
          collaborators: [...project.collaborators, selectedUser],
        }
      }
      return project
    })

    setProjects(updatedProjects)
    enqueueSnackbar("Colaborador añadido exitosamente", { variant: "success" })
    setSelectedUser(0)
  }

  return (
    <main className="bg-violet-100 w-full min-h-screen">
      <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Añadir Colaborador a Proyecto</h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center bg-violet-700 hover:bg-violet-800 px-4 py-2 rounded-md transition duration-300"
        >
          <FaSignOutAlt className="mr-2" />
          Dashboard
        </button>
      </header>

      <section className="p-4 max-w-xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
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

          <div className="mb-4">
            <label htmlFor="collaborator" className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Colaborador
            </label>
            <select
              id="collaborator"
              value={selectedUser}
              onChange={(e) => setSelectedUser(Number(e.target.value))}
              className="w-full p-2 border rounded"
            >
              <option value={0}>Selecciona un colaborador</option>
              {availableCollaborators.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAddCollaborator}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded inline-flex items-center justify-center"
          >
            <FaUserPlus className="mr-2" />
            Añadir Colaborador
          </button>
        </div>

        {selectedProject !== 0 && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Colaboradores Actuales</h2>
            <ul className="list-disc pl-5">
              {projects
                .find((project) => project.id === selectedProject)
                ?.collaborators.map((collaboratorId) => (
                  <li key={collaboratorId}>{users.find((user) => user.id === collaboratorId)?.name}</li>
                ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  )
}