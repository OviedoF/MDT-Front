"use client"

import { useRouter } from "next/navigation"
import { useSnackbar } from "notistack"
import { useState } from "react"
import { FaEdit, FaSignOutAlt, FaTrash, FaProjectDiagram } from "react-icons/fa"

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
]

const initialProjects: Project[] = [
  { id: 1, name: "Proyecto A", description: "Descripción del Proyecto A", supervisor: 1, collaborators: [2, 3] },
  { id: 2, name: "Proyecto B", description: "Descripción del Proyecto B", supervisor: 1, collaborators: [2] },
]

export default function ManageProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [newProject, setNewProject] = useState<Omit<Project, "id">>({
    name: "",
    description: "",
    supervisor: 0,
    collaborators: [],
  })
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  const validateProject = (project: Omit<Project, "id">) => {
    if (!project.name.trim()) {
      enqueueSnackbar("El nombre del proyecto es obligatorio", { variant: "warning" })
      return false
    }
    if (project.supervisor === 0) {
      enqueueSnackbar("Debe seleccionar un supervisor", { variant: "warning" })
      return false
    }
    return true
  }

  const handleCreateProject = () => {
    if (!validateProject(newProject)) return
    setProjects([...projects, { ...newProject, id: projects.length + 1 }])
    setIsCreateModalOpen(false)
    setNewProject({ name: "", description: "", supervisor: 0, collaborators: [] })
    enqueueSnackbar("Proyecto creado exitosamente", { variant: "success" })
  }

  const handleUpdateProject = () => {
    if (currentProject && validateProject(currentProject)) {
      setProjects(projects.map((project) => (project.id === currentProject.id ? currentProject : project)))
      setIsEditModalOpen(false)
      setCurrentProject(null)
      enqueueSnackbar("Proyecto actualizado correctamente", { variant: "success" })
    }
  }

  const handleDeleteProject = () => {
    if (currentProject) {
      setProjects(projects.filter((project) => project.id !== currentProject.id))
      setIsDeleteModalOpen(false)
      enqueueSnackbar("Proyecto eliminado", { variant: "error" })
      setCurrentProject(null)
    }
  }

  return (
    <main className="bg-violet-100 w-full min-h-screen">
      <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">wProyectos</h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center bg-violet-700 hover:bg-violet-800 px-4 py-2 rounded-md transition duration-300"
        >
          <FaSignOutAlt className="mr-2" />
          Dashboard
        </button>
      </header>

      <section className="p-4">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="mb-6 bg-violet-700 hover:bg-violet-800 text-white font-bold py-2 px-4 rounded inline-flex items-center mt-4 w-full"
        >
          <FaProjectDiagram className="mr-2" />
          Crear Proyecto
        </button>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Supervisor
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Colaboradores
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{project.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{project.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {initialUsers.find((user) => user.id === project.supervisor)?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {project.collaborators.map((id) => initialUsers.find((user) => user.id === id)?.name).join(", ")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setCurrentProject(project)
                        setIsEditModalOpen(true)
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentProject(project)
                        setIsDeleteModalOpen(true)
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full px-4">
          <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white w-full">
            <h3 className="text-lg font-bold mb-4">Crear Proyecto</h3>
            <input
              type="text"
              placeholder="Nombre del Proyecto"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <textarea
              placeholder="Descripción (opcional)"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <select
              value={newProject.supervisor}
              onChange={(e) => setNewProject({ ...newProject, supervisor: Number(e.target.value) })}
              className="w-full p-2 mb-4 border rounded"
            >
              <option value={0}>Seleccionar Supervisor</option>
              {initialUsers
                .filter((user) => user.role === "supervisor")
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
            </select>
            <select
              multiple
              value={newProject.collaborators.map(String)}
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  collaborators: Array.from(e.target.selectedOptions, (option) => Number(option.value)),
                })
              }
              className="w-full p-2 mb-4 border rounded"
            >
              {initialUsers
                .filter((user) => user.role === "colaborador")
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
            </select>
            <div className="flex justify-end">
              <button
                onClick={handleCreateProject}
                className="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Crear
              </button>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && currentProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full px-4">
          <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white w-full">
            <h3 className="text-lg font-bold mb-4">Editar Proyecto</h3>
            <input
              type="text"
              placeholder="Nombre del Proyecto"
              value={currentProject.name}
              onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <textarea
              placeholder="Descripción (opcional)"
              value={currentProject.description}
              onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <select
              value={currentProject.supervisor}
              onChange={(e) => setCurrentProject({ ...currentProject, supervisor: Number(e.target.value) })}
              className="w-full p-2 mb-4 border rounded"
            >
              <option value={0}>Seleccionar Supervisor</option>
              {initialUsers
                .filter((user) => user.role === "supervisor")
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
            </select>
            <select
              multiple
              value={currentProject.collaborators.map(String)}
              onChange={(e) =>
                setCurrentProject({
                  ...currentProject,
                  collaborators: Array.from(e.target.selectedOptions, (option) => Number(option.value)),
                })
              }
              className="w-full p-2 mb-4 border rounded"
            >
              {initialUsers
                .filter((user) => user.role === "colaborador")
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
            </select>
            <div className="flex justify-end">
              <button
                onClick={handleUpdateProject}
                className="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Actualizar
              </button>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      {isDeleteModalOpen && currentProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full px-4">
          <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar Eliminación</h3>
            <p>¿Estás seguro de que quieres eliminar el proyecto {currentProject.name}?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleDeleteProject}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Eliminar
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}