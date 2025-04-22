"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSnackbar } from "notistack"
import { FaUserPlus, FaSignOutAlt } from "react-icons/fa"
import { makeQuery } from "@/app/utils/api"

interface User {
  _id: string
  name: string
  email: string
  password: string
  role: "topografo" | "colaborador" | "admin"
}

interface WorkingHours {
  startTime: string
  endTime: string
}

interface WorkSchedule {
  monday: WorkingHours
  tuesday: WorkingHours
  wednesday: WorkingHours
  thursday: WorkingHours
  friday: WorkingHours
}
interface Project {
  _id: string
  name: string
  description: string
  supervisor: number
  topographers: number[]
  collaborators: number[]
  totalCost: number
  hourlyRate: number
  billingDate: Date | null
  startDate: Date | null
  endDate: Date | null
  active: boolean
  workSchedule: WorkSchedule
  workedHours?: number
}

export default function AddCollaboratorPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  const [availableCollaborators, setAvailableCollaborators] = useState<User[]>([])

  useEffect(() => {
    // Filter out users who are already collaborators or are topografos
    let availableUsers = users.filter((user) => user.role === "colaborador")

    if (selectedProject) {
      availableUsers = availableUsers.filter((user) => {
        const project = projects.find((project) => project._id === selectedProject)
        return project && !project.collaborators.some((collaborator : any) => collaborator === user._id)
      })
    }

      setAvailableCollaborators(availableUsers)
    }, [selectedProject, users, projects])

  const handleAddCollaborator = () => {
    if (selectedUser === '' || selectedProject === '') {
      enqueueSnackbar("Por favor, selecciona un colaborador y un proyecto", { variant: "warning" })
      return
    }

    const project = projects.find((project) => project._id === selectedProject)

    if (project?.collaborators.some((collaborator: any) => collaborator._id === selectedUser)) {
      enqueueSnackbar("El colaborador ya está asignado a este proyecto", { variant: "warning" })
      return
    }

    const newCollaborators = project?.collaborators.map((collaborator: any) => collaborator._id)

    newCollaborators?.push(selectedUser)

    makeQuery(
      localStorage.getItem("token"),
      "updateProject",
      { ...project, collaborators: newCollaborators },
      enqueueSnackbar,
      (response) => {
        getProjects()
        enqueueSnackbar("Colaborador añadido al proyecto", { variant: "success" })
        setSelectedUser('')
        setSelectedProject('')
      },
      setLoading,
      () => { }
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
        console.log(response)
      },
      setLoading,
      () => { }
    )
  }

  useEffect(() => {
    getProjects()
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token");
    makeQuery(
      token,
      "getUsers",
      "",
      enqueueSnackbar,
      (data) => setUsers(data),
    );
  }, []);

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
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value={0}>Selecciona un proyecto</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
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
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value={0}>Selecciona un colaborador</option>
              {availableCollaborators.map((user) => (
                <option key={user._id} value={user._id}>
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

        {selectedProject && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Colaboradores Actuales</h2>
            <ul className="list-disc pl-5">
              {projects
                .find((project) => project._id === selectedProject)
                ?.collaborators.map((collaborator:any) => (
                  <li key={collaborator._id}>{collaborator?.name}</li>
                ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  )
}