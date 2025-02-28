"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSnackbar } from "notistack"
import { FaEdit, FaSignOutAlt, FaTrash, FaProjectDiagram } from "react-icons/fa"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

interface User {
  id: number
  name: string
  role: "supervisor" | "colaborador" | "topografo"
}

interface Project {
  id: number
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
}

const initialUsers: User[] = [
  { id: 1, name: "Juan Pérez", role: "supervisor" },
  { id: 2, name: "María García", role: "colaborador" },
  { id: 3, name: "Carlos López", role: "topografo" },
  { id: 4, name: "Ana Rodríguez", role: "topografo" },
]

const initialProjects: Project[] = [
  {
    id: 1,
    name: "Proyecto A",
    description: "Descripción del Proyecto A",
    supervisor: 1,
    topographers: [3],
    collaborators: [2],
    totalCost: 10000,
    hourlyRate: 50,
    billingDate: new Date(),
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  },
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
    topographers: [],
    collaborators: [],
    totalCost: 0,
    hourlyRate: 0,
    billingDate: null,
    startDate: null,
    endDate: null,
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
    if (project.totalCost < 0) {
      enqueueSnackbar("El costo total debe ser un número positivo", { variant: "warning" })
      return false
    }
    if (project.hourlyRate < 0) {
      enqueueSnackbar("El costo por hora debe ser un número positivo", { variant: "warning" })
      return false
    }
    if (!project.billingDate || !project.startDate || !project.endDate) {
      enqueueSnackbar("Todas las fechas son obligatorias", { variant: "warning" })
      return false
    }
    if (project.startDate > project.endDate) {
      enqueueSnackbar("La fecha de inicio debe ser anterior a la fecha final", { variant: "warning" })
      return false
    }
    return true
  }

  const handleCreateProject = () => {
    if (!validateProject(newProject)) return
    setProjects([...projects, { ...newProject, id: projects.length + 1 }])
    setIsCreateModalOpen(false)
    setNewProject({
      name: "",
      description: "",
      supervisor: 0,
      topographers: [],
      collaborators: [],
      totalCost: 0,
      hourlyRate: 0,
      billingDate: null,
      startDate: null,
      endDate: null,
    })
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

  const ProjectForm = ({ project, setProject, isNewProject = false }) => (
    <>
      <input
        type="text"
        placeholder="Nombre del Proyecto"
        value={project.name}
        onChange={(e) => setProject({ ...project, name: e.target.value })}
        className="w-full p-2 mb-4 border rounded"
      />
      <textarea
        placeholder="Descripción (opcional)"
        value={project.description}
        onChange={(e) => setProject({ ...project, description: e.target.value })}
        className="w-full p-2 mb-4 border rounded"
      />
      <select
        value={project.supervisor}
        onChange={(e) => setProject({ ...project, supervisor: Number(e.target.value) })}
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
        value={project.topographers.map(String)}
        onChange={(e) =>
          setProject({
            ...project,
            topographers: Array.from(e.target.selectedOptions, (option) => Number(option.value)),
          })
        }
        className="w-full p-2 mb-4 border rounded"
      >
        {initialUsers
          .filter((user) => user.role === "topografo")
          .map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
      </select>
      <select
        multiple
        value={project.collaborators.map(String)}
        onChange={(e) =>
          setProject({
            ...project,
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
      <input
        type="number"
        placeholder="Costo Total del Proyecto"
        value={project.totalCost}
        onChange={(e) => setProject({ ...project, totalCost: Math.max(0, Number(e.target.value)) })}
        min="0"
        step="0.01"
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="number"
        placeholder="Costo por Hora"
        value={project.hourlyRate}
        onChange={(e) => setProject({ ...project, hourlyRate: Math.max(0, Number(e.target.value)) })}
        min="0"
        step="0.01"
        className="w-full p-2 mb-4 border rounded"
      />
      <div className="mb-4 flex flex-col">
        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Facturación</label>
        <DatePicker
          selected={project.billingDate}
          onChange={(date: Date) => setProject({ ...project, billingDate: date })}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4 flex flex-col">
        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
        <DatePicker
          selected={project.startDate}
          onChange={(date: Date) => setProject({ ...project, startDate: date })}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4 flex flex-col">
        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Final</label>
        <DatePicker
          selected={project.endDate}
          onChange={(date: Date) => setProject({ ...project, endDate: date })}
          className="w-full p-2 border rounded"
        />
      </div>
    </>
  )

  return (
    <main className="bg-violet-100 w-full min-h-screen">
      <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manejar Proyectos</h1>
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
                  Supervisor
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Topógrafos
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Costo Total
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Costo por Hora
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Fecha Inicio
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Fecha Final
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    {initialUsers.find((user) => user.id === project.supervisor)?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {project.topographers.map((id) => initialUsers.find((user) => user.id === id)?.name).join(", ")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">${project.totalCost.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${project.hourlyRate.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{project.startDate?.toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{project.endDate?.toLocaleDateString()}</td>
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
          <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white w-full max-w-2xl">
            <h3 className="text-lg font-bold mb-4">Crear Proyecto</h3>
            <ProjectForm project={newProject} setProject={setNewProject} isNewProject={true} />
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
          <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white w-full max-w-2xl">
            <h3 className="text-lg font-bold mb-4">Editar Proyecto</h3>
            <ProjectForm project={currentProject} setProject={setCurrentProject} />
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
          <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white w-full max-w-md">
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

