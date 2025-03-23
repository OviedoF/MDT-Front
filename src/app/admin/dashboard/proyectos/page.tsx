"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSnackbar } from "notistack"
import { FaEdit, FaSignOutAlt, FaTrash, FaProjectDiagram, FaFileAlt, FaClock } from "react-icons/fa"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

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
  active: boolean
  workSchedule: WorkSchedule
}

const initialUsers: User[] = [
  { id: 1, name: "Juan Pérez", role: "supervisor" },
  { id: 2, name: "María García", role: "colaborador" },
  { id: 3, name: "Carlos López", role: "topografo" },
  { id: 4, name: "Ana Rodríguez", role: "topografo" },
]

const defaultWorkSchedule: WorkSchedule = {
  monday: { startTime: "09:00", endTime: "17:00" },
  tuesday: { startTime: "09:00", endTime: "17:00" },
  wednesday: { startTime: "09:00", endTime: "17:00" },
  thursday: { startTime: "09:00", endTime: "17:00" },
  friday: { startTime: "09:00", endTime: "17:00" },
}

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
    active: true,
    workSchedule: defaultWorkSchedule,
  },
  {
    id: 2,
    name: "Proyecto B",
    description: "Descripción del Proyecto B",
    supervisor: 1,
    topographers: [4],
    collaborators: [2],
    totalCost: 15000,
    hourlyRate: 60,
    billingDate: new Date(),
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
    active: true,
    workSchedule: defaultWorkSchedule,
  },
]

export default function ManageProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [newProject, setNewProject] = useState<Omit<Project, "id" | "active">>({
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
    workSchedule: defaultWorkSchedule,
  })
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  const validateProject = (project: Omit<Project, "id" | "active">) => {
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
    setProjects([...projects, { ...newProject, id: projects.length + 1, active: true }])
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
      workSchedule: defaultWorkSchedule,
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

  const handleOpenReportModal = (project: Project) => {
    setCurrentProject(project)
    setIsReportModalOpen(true)
  }

  const ProjectForm = ({ project, setProject, isNewProject = false }) => {
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
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Facturación</label>
          <DatePicker
            selected={project.billingDate}
            onChange={(date: Date) => setProject({ ...project, billingDate: date })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
          <DatePicker
            selected={project.startDate}
            onChange={(date: Date) => setProject({ ...project, startDate: date })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Final</label>
          <DatePicker
            selected={project.endDate}
            onChange={(date: Date) => setProject({ ...project, endDate: date })}
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
                      className="text-red-600 hover:text-red-900 mr-2"
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={() => handleOpenReportModal(project)}
                      className="text-success hover:text-success"
                    >
                      <FaFileAlt />
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
    const project = projects.find((p) => p.id === projectId)
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
              value={selectedProject.id}
              onChange={(e) => handleProjectChange(Number(e.target.value))}
              className="w-full p-2 border rounded"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
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
                onChange={(date: Date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="w-full p-2 border rounded"
                placeholderText="Fecha inicio"
              />
              <DatePicker
                selected={endDate}
                onChange={(date: Date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
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
                  <td className="py-2">{hoursWorked} horas</td>
                </tr>
                <tr className="border-t">
                  <td className="py-2 font-semibold">Total:</td>
                  <td className="py-2">${(selectedProject.hourlyRate * hoursWorked).toFixed(2)}</td>
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

