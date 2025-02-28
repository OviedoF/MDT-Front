"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSnackbar } from "notistack"
import { FaSignOutAlt, FaUserPlus } from "react-icons/fa"

interface User {
  id: number
  name: string
  role: "supervisor" | "colaborador" | "topografo"
  assignedProject: number | null
  availableHours: number
}

interface Project {
  id: number
  name: string
  active: boolean
}

const initialUsers: User[] = [
  { id: 1, name: "Juan Pérez", role: "colaborador", assignedProject: null, availableHours: 40 },
  { id: 2, name: "María García", role: "colaborador", assignedProject: 1, availableHours: 20 },
  { id: 3, name: "Carlos López", role: "topografo", assignedProject: null, availableHours: 40 },
  { id: 4, name: "Ana Rodríguez", role: "topografo", assignedProject: 2, availableHours: 30 },
  { id: 5, name: "Pedro Sánchez", role: "colaborador", assignedProject: null, availableHours: 40 },
]

const initialProjects: Project[] = [
  { id: 1, name: "Proyecto A", active: true },
  { id: 2, name: "Proyecto B", active: true },
  { id: 3, name: "Proyecto C", active: false },
]

export default function AvailableCollaboratorsPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  const availableUsers = users.filter((user) => user.assignedProject === null)
  const assignedUsers = users.filter((user) => user.assignedProject !== null)

  const handleAssignUser = (projectId: number) => {
    if (selectedUser) {
      const updatedUsers = users.map((user) =>
        user.id === selectedUser.id ? { ...user, assignedProject: projectId } : user,
      )
      setUsers(updatedUsers)
      setIsAssignModalOpen(false)
      setSelectedUser(null)
      enqueueSnackbar(`${selectedUser.name} ha sido asignado al proyecto`, { variant: "success" })
    }
  }

  return (
    <main className="bg-violet-100 w-full min-h-screen">
      <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Colaboradores Disponibles</h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center bg-violet-700 hover:bg-violet-800 px-4 py-2 rounded-md transition duration-300"
        >
          <FaSignOutAlt className="mr-2" />
          Dashboard
        </button>
      </header>

      <section className="p-4">
        <h2 className="text-xl font-bold mb-4">Colaboradores Disponibles</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Horas Disponibles
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {availableUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.availableHours}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedUser(user)
                        setIsAssignModalOpen(true)
                      }}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                      <FaUserPlus className="inline mr-2" />
                      Asignar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-bold my-4">Colaboradores Asignados</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Proyecto Asignado
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Horas Disponibles
                </th>
              </tr>
            </thead>
            <tbody>
              {assignedUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {projects.find((p) => p.id === user.assignedProject)?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.availableHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Assign User Modal */}
      {isAssignModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full px-4">
          <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Asignar a {selectedUser.name}</h3>
            <p className="mb-4">Selecciona un proyecto activo para asignar al colaborador:</p>
            <div className="space-y-2">
              {projects
                .filter((p) => p.active)
                .map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleAssignUser(project.id)}
                    className="w-full bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded"
                  >
                    {project.name}
                  </button>
                ))}
            </div>
            <button
              onClick={() => setIsAssignModalOpen(false)}
              className="mt-4 w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </main>
  )
}