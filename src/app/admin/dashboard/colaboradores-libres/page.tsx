"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSnackbar } from "notistack"
import { FaSignOutAlt, FaUserPlus } from "react-icons/fa"
import { makeQuery } from "@/app/utils/api"
import { get } from "http"

interface AvailableUser {
  name: string
  availableHours: number
  role: "colaborador" | "topografo"
}

interface AssignedUser {
  name: string
  availableHours: number
  role: "colaborador" | "topografo"
  project: string | null
}

interface UserData {
  available: AvailableUser[]
  assigned: AssignedUser[]
}

interface User {
  _id: string
  name: string
  role: "supervisor" | "colaborador" | "topografo"
  assignedProject: number | null
  availableHours: number
}

interface Project {
  _id: string
  name: string
  active: boolean
}

export default function AvailableCollaboratorsPage() {
  const [usersData, setUsersData] = useState<UserData>({
    assigned: [],
    available: [],
  })
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  const handleAssignUser = (projectId: number) => {
    if (selectedUser) {
      alert(`Asignando a ${selectedUser._id} al proyecto ${projectId}`)
      makeQuery(
        localStorage.getItem("token"),
        "assignUserToProject",
        { userId: selectedUser._id, projectId },
        enqueueSnackbar,
        (response) => {
          // Handle success response if needed
          setIsAssignModalOpen(false)
          setSelectedUser(null)
          enqueueSnackbar(`${selectedUser.name} ha sido asignado al proyecto`, { variant: "success" })
          getProjects()
          getCollaboratorsStatus()
        }
      )
    }
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
      setLoading,
      () => { }
    )
  }

  const getCollaboratorsStatus = () => {
    const token = localStorage.getItem("token");
    makeQuery(
      token,
      "getCollaboratorsStatus",
      "",
      enqueueSnackbar,
      (data) => setUsersData(data),
    );
  }

  useEffect(() => {
    getProjects()
    getCollaboratorsStatus()
  }, [])

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
              {usersData?.available?.map((user: any) => (
                <tr key={JSON.stringify(user)}>
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
              {usersData?.assigned?.map((user) => (
                <tr key={
                  JSON.stringify(user)
                }>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.project || "N/A"}
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
                .map((project: any) => (
                  <button
                    key={project._id}
                    onClick={() => handleAssignUser(project._id)}
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