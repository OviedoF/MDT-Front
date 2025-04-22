"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSnackbar } from "notistack"
import { FaEdit, FaSignOutAlt, FaTrash, FaProjectDiagram, FaFileAlt, FaClock, FaCheck } from "react-icons/fa"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { makeQuery } from "@/app/utils/api"
import { FaXmark } from "react-icons/fa6"

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

interface User {
  _id: string
  name: string
  email: string
  password: string
  role: "topografo" | "colaborador" | "admin"
}

interface Project {
  _id: string
  name: string
  description: string
  supervisor: User
  topographers: number[]
  collaborators: number[]
  totalCost: number
  hourlyRate: number
  billingDate: Date | string
  startDate: Date | string
  endDate: Date | string
  active: boolean
  workSchedule: WorkSchedule
  workedHours: number
}

const defaultWorkSchedule: WorkSchedule = {
  monday: { startTime: "09:00", endTime: "17:00" },
  tuesday: { startTime: "09:00", endTime: "17:00" },
  wednesday: { startTime: "09:00", endTime: "17:00" },
  thursday: { startTime: "09:00", endTime: "17:00" },
  friday: { startTime: "09:00", endTime: "17:00" },
}

export default function ManageProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [newProject, setNewProject] = useState<Omit<Project, "_id" | "active">>({
    name: "",
    description: "",
    supervisor: {
      _id: "",
      name: "",
      email: "",
      password: "",
      role: "admin",
    },
    topographers: [],
    collaborators: [],
    totalCost: 0,
    hourlyRate: 0,
    billingDate: new Date(),
    startDate: new Date(),
    endDate: new Date(),
    workedHours: 0,
    workSchedule: defaultWorkSchedule,
  })
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [toggleActiveModal, setToggleActiveModal] = useState(false)
  const [toggleDesactiveModal, setToggleDesactiveModal] = useState(false)
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  const validateProject = (project: Omit<Project, "_id" | "active">) => {
    if (!project.name.trim()) {
      enqueueSnackbar("El nombre del proyecto es obligatorio", { variant: "warning" })
      return false
    }
    if (project.supervisor._id === "") {
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

    // Validar horarios
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const
    for (const day of days) {
      const { startTime, endTime } = project.workSchedule[day]
      if (!startTime || !endTime) {
        enqueueSnackbar(`Debe especificar el horario para ${getDayName(day)}`, { variant: "warning" })
        return false
      }
      if (startTime >= endTime) {
        enqueueSnackbar(`La hora de inicio debe ser anterior a la hora de fin para ${getDayName(day)}`, {
          variant: "warning",
        })
        return false
      }
    }

    return true
  }

  const getDayName = (day: keyof WorkSchedule) => {
    const dayNames = {
      monday: "Lunes",
      tuesday: "Martes",
      wednesday: "Miércoles",
      thursday: "Jueves",
      friday: "Viernes",
    }
    return dayNames[day]
  }

  const handleCreateProject = () => {
    if (!validateProject(newProject)) return
    makeQuery(
      localStorage.getItem("token"),
      "createProject",
      { ...newProject, active: true },
      enqueueSnackbar,
      (response) => {
        getProjects()
        setIsCreateModalOpen(false)
        setNewProject({
          name: "",
          description: "",
          supervisor:  {
            _id: "",
            name: "",
            email: "",
            password: "",
            role: "admin",
          },
          topographers: [],
          collaborators: [],
          totalCost: 0,
          hourlyRate: 0,
          billingDate: new Date(),
          startDate: new Date(),
          endDate: new Date(),
          workedHours: 0,
          workSchedule: defaultWorkSchedule,
        })
        enqueueSnackbar("Proyecto creado exitosamente", { variant: "success" })
      },
      setLoading,
      () => {
        setIsCreateModalOpen(false)
        enqueueSnackbar("Error al crear el proyecto", { variant: "error" })
      }
    )
  }

  const handleUpdateProject = () => {
    if (currentProject && validateProject(currentProject)) {
      makeQuery(
        localStorage.getItem("token"),
        "updateProject",
        { ...currentProject, active: true },
        enqueueSnackbar,
        (response) => {
          getProjects()
          setIsEditModalOpen(false)
          setCurrentProject(null)
          enqueueSnackbar("Proyecto actualizado correctamente", { variant: "success" })
        },
        setLoading,
        () => {
          setIsEditModalOpen(false)
          enqueueSnackbar("Error al actualizar el proyecto", { variant: "error" })
        }
      )
    }
  }

  const handleDeleteProject = () => {
    if (currentProject) {
      makeQuery(
        localStorage.getItem("token"),
        "deleteProject",
        currentProject._id,
        enqueueSnackbar,
        (response) => {
          getProjects()
          setIsDeleteModalOpen(false)
          enqueueSnackbar("Proyecto eliminado correctamente", { variant: "success" })
        },
        setLoading,
        () => {
          setIsDeleteModalOpen(false)
          enqueueSnackbar("Error al eliminar el proyecto", { variant: "error" })
        }
      )
    }
  }

  const handleOpenReportModal = (project: Project) => {
    setCurrentProject(project)
    setIsReportModalOpen(true)
  }

  const handleActiveProject = () => {
    if (currentProject) {
      makeQuery(
        localStorage.getItem("token"),
        "updateProject",
        { ...currentProject, active: true },
        enqueueSnackbar,
        (response) => {
          getProjects()
          setToggleActiveModal(false)
          setToggleDesactiveModal(false)
          setCurrentProject(null)
          enqueueSnackbar("Proyecto habilitado correctamente", { variant: "success" })
        },
        setLoading,
        () => {
          setToggleActiveModal(false)
          enqueueSnackbar("Error al habilitar el proyecto", { variant: "error" })
        }
      )
    }
  }

  const handleDesactiveProject = () => {
    if (currentProject) {
      makeQuery(
        localStorage.getItem("token"),
        "updateProject",
        { ...currentProject, active: false },
        enqueueSnackbar,
        (response) => {
          getProjects()
          setToggleDesactiveModal(false)
          setToggleActiveModal(false)
          setCurrentProject(null)
          enqueueSnackbar("Proyecto deshabilitado correctamente", { variant: "success" })
        },
        setLoading,
        () => {
          setToggleDesactiveModal(false)
          enqueueSnackbar("Error al deshabilitar el proyecto", { variant: "error" })
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

  const ProjectForm = ({ project, setProject, isNewProject = false }: any) => {
    const updateWorkSchedule = (day: keyof WorkSchedule, field: keyof WorkingHours, value: string) => {
      setProject({
        ...project,
        workSchedule: {
          ...project.workSchedule,
          [day]: {
            ...project.workSchedule[day],
            [field]: value,
          },
        },
      })
    }

    return (
      <>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Proyecto</label>
        <input
          type="text"
          placeholder="Nombre del Proyecto"
          value={project.name}
          onChange={(e) => setProject({ ...project, name: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
        />
        <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
        <textarea
          placeholder="Descripción (opcional)"
          value={project.description}
          onChange={(e) => setProject({ ...project, description: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
        />
        <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Supervisor</label>
        <select
          value={project.supervisor}
          onChange={(e) => setProject({ ...project, supervisor: e.target.value })}
          className="w-full p-2 mb-4 border rounded"
        >
          <option value={0}>Seleccionar Supervisor</option>
          {users
            .map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
        </select>
        <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Topógrafos</label>
        <select
          multiple
          value={project.topographers.map(String)}
          onChange={(e) =>
            setProject({
              ...project,
              topographers: Array.from(e.target.selectedOptions, (option) => option.value),
            })
          }
          className="w-full p-2 mb-4 border rounded"
        >
          {users
            .filter((user) => user.role === "topografo")
            .map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
        </select>
        <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Colaboradores</label>
        <select
          multiple
          value={project.collaborators.map(String)}
          onChange={(e) =>
            setProject({
              ...project,
              collaborators: Array.from(e.target.selectedOptions, (option) => option.value),
            })
          }
          className="w-full p-2 mb-4 border rounded"
        >
          {users
            .filter((user) => user.role === "colaborador")
            .map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
        </select>
        <label className="block text-sm font-medium text-gray-700 mb-2">Costo Total del Proyecto</label>
        <input
          type="number"
          placeholder="Costo Total del Proyecto"
          value={project.totalCost}
          onChange={(e) => setProject({ ...project, totalCost: Math.max(0, Number(e.target.value)) })}
          min="0"
          step="0.01"
          className="w-full p-2 mb-4 border rounded"
        />
        <label className="block text-sm font-medium text-gray-700 mb-2">Costo por Hora</label>
        <input
          type="number"
          placeholder="Costo por Hora"
          value={project.hourlyRate}
          onChange={(e) => setProject({ ...project, hourlyRate: Math.max(0, Number(e.target.value)) })}
          min="0"
          step="0.01"
          className="w-full p-2 mb-4 border rounded"
        />

        {
          (project.totalCost && project.hourlyRate) && <p className="text-sm text-gray-500 mb-2">
            Horas totales del proyecto: {project.totalCost / project.hourlyRate} horas
          </p>
        }

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Facturación</label>
          <DatePicker
            selected={project.billingDate}
            onChange={(date: any) => setProject({ ...project, billingDate: date })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
          <DatePicker
            selected={project.startDate}
            onChange={(date: any) => setProject({ ...project, startDate: date })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Final</label>
          <DatePicker
            selected={project.endDate}
            onChange={(date: any) => setProject({ ...project, endDate: date })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <h4 className="text-md font-semibold mb-2 flex items-center">
            <FaClock className="mr-2" /> Horario de Trabajo Normal
          </h4>
          <p className="text-sm text-gray-500 mb-2">
            Defina el horario normal de trabajo para cada día. Las horas fuera de este horario se considerarán como
            horas extra.
          </p>

          <div className="space-y-3">
            {(["monday", "tuesday", "wednesday", "thursday", "friday"] as const).map((day) => (
              <div key={day} className="flex items-center">
                <span className="w-24 font-medium">{getDayName(day)}:</span>
                <div className="flex items-center">
                  <input
                    type="time"
                    value={project.workSchedule[day].startTime}
                    onChange={(e) => updateWorkSchedule(day, "startTime", e.target.value)}
                    className="p-2 border rounded mr-2"
                  />
                  <span>a</span>
                  <input
                    type="time"
                    value={project.workSchedule[day].endTime}
                    onChange={(e) => updateWorkSchedule(day, "endTime", e.target.value)}
                    className="p-2 border rounded ml-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

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
                  Estado
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{project.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {project.supervisor?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {project.topographers.map((topographer:any) => topographer.name).join(", ")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">${project.totalCost.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${project.hourlyRate.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{
                    new Date(project.startDate).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                  }</td>
                  <td className="px-6 py-4 whitespace-nowrap">{
                    new Date(project.startDate).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                  }</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {project.active ? (
                      <span className="text-green-600 font-semibold">Activo</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Inactivo</span>
                    )}
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
                      onClick={() => handleOpenReportModal(project)}
                      className="text-success hover:text-success"
                    >
                      <FaFileAlt />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentProject(project)
                        setIsDeleteModalOpen(true)
                      }}
                      className="text-red-600 hover:text-red-900 ml-2"
                    >
                      <FaTrash />
                    </button>

                    {/* Botón de deshabilitar y habilitar */}
                    <button
                      onClick={() => {
                        setCurrentProject(project)
                      }}
                      className={`${
                        project.active ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"
                      } ml-2`}
                    >
                      {project.active ? (
                        <span className="text-sm font-semibold">
                          <FaXmark className="mr-1" onClick={() => setToggleActiveModal(true)} />
                        </span>
                      ) : (
                        <span className="text-sm font-semibold">
                          <FaCheck className="mr-1" onClick={() => setToggleDesactiveModal(true)} />
                        </span>
                      )}
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
          <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Crear Proyecto</h3>
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <ProjectForm project={newProject} setProject={setNewProject} isNewProject={true} />
            </div>
            <div className="flex justify-end mt-4">
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
          <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Editar Proyecto</h3>
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <ProjectForm project={currentProject} setProject={setCurrentProject} />
            </div>
            <div className="flex justify-end mt-4">
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

      {/* Toggle Active Project Modal */}
      {toggleActiveModal && currentProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full px-4">
          <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Confirmar Deshabilitar</h3>
            <p>¿Estás seguro de que quieres deshabilitar el proyecto {currentProject.name}?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleDesactiveProject}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Deshabilitar
              </button>
              <button
                onClick={() => setToggleActiveModal(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Desactive Project Modal */}
      {toggleDesactiveModal && currentProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full px-4">
          <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Confirmar Habilitar</h3>
            <p>¿Estás seguro de que quieres habilitar el proyecto {currentProject.name}?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleActiveProject}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Habilitar
              </button>
              <button
                onClick={() => setToggleDesactiveModal(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && currentProject && (
        <ProjectReportModal
          project={currentProject}
          onClose={() => setIsReportModalOpen(false)}
          projects={projects.filter((p) => p.active)}
        />
      )}
    </main>
  )
}

interface ProjectReportModalProps {
  project: Project
  onClose: () => void
  projects: Project[]
}

function ProjectReportModal({ project: initialProject, onClose, projects }: ProjectReportModalProps) {
  const [selectedProject, setSelectedProject] = useState<Project>(initialProject)
  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(new Date())
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [hoursWorked, setHoursWorked] = useState(120) // Valor de ejemplo

  const handleProjectChange = (projectId: number) => {
    const project = projects.find((p:any) => p._id === projectId)
    if (project) {
      setSelectedProject(project)
    }
  }

  const handleSendReport = () => {
    setShowConfirmation(true)
  }

  const confirmSendReport = () => {
    // Aquí iría la lógica para enviar el informe
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white w-full max-w-4xl">
        <h3 className="text-lg font-bold mb-4">Informe del Proyecto</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Proyecto</label>
            <select
              value={selectedProject._id}
              onChange={(e) => handleProjectChange(Number(e.target.value))}
              className="w-full p-2 border rounded"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Intervalo de Tiempo</label>
            <div className="flex space-x-2">
              <DatePicker
                selected={startDate}
                onChange={(date: any) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="w-full p-2 border rounded"
                placeholderText="Fecha inicio"
              />
              <DatePicker
                selected={endDate}
                onChange={(date: any) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate || new Date()}
                className="w-full p-2 border rounded"
                placeholderText="Fecha fin"
              />
            </div>
          </div>
        </div>

        <div className="border p-4 rounded-lg bg-gray-50 mb-4">
          <h4 className="text-md font-semibold mb-2">Vista Previa del Informe</h4>
          <div className="bg-white p-4 border rounded">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">Informe del Proyecto: {selectedProject.name}</h2>
              <p className="text-sm text-gray-500">
                Período: {startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()}
              </p>
            </div>

            <table className="min-w-full">
              <tbody>
                <tr>
                  <td className="py-2 font-semibold">Nombre del Proyecto:</td>
                  <td className="py-2">{selectedProject.name}</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold">Costo del Proyecto:</td>
                  <td className="py-2">${selectedProject.totalCost.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold">Costo por Hora:</td>
                  <td className="py-2">${selectedProject.hourlyRate.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold">Horas Trabajadas:</td>
                  <td className="py-2">{selectedProject.workedHours || 0} horas</td>
                </tr>
                <tr className="border-t">
                  <td className="py-2 font-semibold">Total:</td>
                  <td className="py-2">${(selectedProject.hourlyRate * selectedProject.workedHours).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSendReport}
            className="bg-success hover:bg-success text-white font-bold py-2 px-4 rounded mr-2"
          >
            Enviar Informe
          </button>
          <button onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancelar
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar Envío</h3>
            <p>
              Este es el informe que se enviará a los encargados del proyecto "{selectedProject.name}". ¿Está seguro?
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={confirmSendReport}
                className="bg-success hover:bg-success text-white font-bold py-2 px-4 rounded mr-2"
              >
                Sí, Enviar
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

