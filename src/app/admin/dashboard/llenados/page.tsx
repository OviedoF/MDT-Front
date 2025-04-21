"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSnackbar } from "notistack"
import {
  FaSignOutAlt,
  FaExclamationTriangle,
  FaEdit,
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaTrash,
  FaClock,
  FaCheck,
} from "react-icons/fa"
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

interface Activity {
  id: string
  description: string
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

interface TimeEntry {
  regularHours: number
  startTime: string
  endTime: string
  activities: Activity[]
  overtimeStartTime: string
  overtimeEndTime: string
  overtimeActivities: Activity[]
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
  const { enqueueSnackbar } = useSnackbar()
  const [projectsData, setProjectsData] = useState<ProjectMissingHours[]>([])
  const [expandedProject, setExpandedProject] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [timeEntry, setTimeEntry] = useState<TimeEntry>({
    regularHours: 0,
    startTime: "09:00",
    endTime: "17:00",
    activities: [{ id: "1", description: "" }],
    overtimeStartTime: "17:00",
    overtimeEndTime: "19:00",
    overtimeActivities: [{ id: "1", description: "" }],
  })

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
    // Reiniciar el formulario de entrada de tiempo
    setTimeEntry({
      regularHours: 8,
      startTime: "09:00",
      endTime: "17:00",
      activities: [{ id: Date.now().toString(), description: "" }],
      overtimeStartTime: "17:00",
      overtimeEndTime: "19:00",
      overtimeActivities: [{ id: Date.now().toString() + "-ot", description: "" }],
    })
    setIsEditModalOpen(true)
  }

  const handleAddActivity = () => {
    setTimeEntry({
      ...timeEntry,
      activities: [...timeEntry.activities, { id: Date.now().toString(), description: "" }],
    })
  }

  const handleRemoveActivity = (id: string) => {
    if (timeEntry.activities.length === 1) {
      enqueueSnackbar("Debe haber al menos una actividad", { variant: "warning" })
      return
    }

    setTimeEntry({
      ...timeEntry,
      activities: timeEntry.activities.filter((activity) => activity.id !== id),
    })
  }

  const handleActivityChange = (id: string, value: string) => {
    setTimeEntry({
      ...timeEntry,
      activities: timeEntry.activities.map((activity) =>
        activity.id === id ? { ...activity, description: value } : activity,
      ),
    })
  }

  const handleAddOvertimeActivity = () => {
    setTimeEntry({
      ...timeEntry,
      overtimeActivities: [...timeEntry.overtimeActivities, { id: Date.now().toString() + "-ot", description: "" }],
    })
  }

  const handleRemoveOvertimeActivity = (id: string) => {
    if (timeEntry.overtimeActivities.length === 1) {
      enqueueSnackbar("Debe haber al menos una actividad para horas extra", { variant: "warning" })
      return
    }

    setTimeEntry({
      ...timeEntry,
      overtimeActivities: timeEntry.overtimeActivities.filter((activity) => activity.id !== id),
    })
  }

  const handleOvertimeActivityChange = (id: string, value: string) => {
    setTimeEntry({
      ...timeEntry,
      overtimeActivities: timeEntry.overtimeActivities.map((activity) =>
        activity.id === id ? { ...activity, description: value } : activity,
      ),
    })
  }

  const calculateHours = (startTime: string, endTime: string): number => {
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    const diffMs = end.getTime() - start.getTime()
    return Math.max(0, diffMs / (1000 * 60 * 60))
  }

  const handleTimeChange = (field: keyof TimeEntry, value: string) => {
    setTimeEntry({
      ...timeEntry,
      [field]: value,
    })

    // Actualizar horas regulares automáticamente cuando cambian los tiempos
    if (field === "startTime" || field === "endTime") {
      const hours = calculateHours(
        field === "startTime" ? value : timeEntry.startTime,
        field === "endTime" ? value : timeEntry.endTime,
      )
      setTimeEntry((prev) => ({
        ...prev,
        regularHours: hours,
        [field]: value,
      }))
    }
  }

  const validateTimeEntry = (): boolean => {
    // Validar que las horas de inicio y fin sean válidas
    if (timeEntry.startTime >= timeEntry.endTime) {
      enqueueSnackbar("La hora de inicio debe ser anterior a la hora de fin", { variant: "error" })
      return false
    }

    // Validar que haya al menos una actividad con descripción
    if (timeEntry.activities.some((activity) => !activity.description.trim())) {
      enqueueSnackbar("Todas las actividades deben tener una descripción", { variant: "error" })
      return false
    }

    // Si hay horas extra, validar los campos de horas extra
    const hasOvertimeHours = timeEntry.overtimeStartTime && timeEntry.overtimeEndTime
    if (hasOvertimeHours) {
      if (timeEntry.overtimeStartTime >= timeEntry.overtimeEndTime) {
        enqueueSnackbar("La hora de inicio extra debe ser anterior a la hora de fin extra", { variant: "error" })
        return false
      }

      // Validar que las horas extra comiencen después de las horas regulares
      if (timeEntry.overtimeStartTime < timeEntry.endTime) {
        enqueueSnackbar("Las horas extra deben comenzar después de las horas regulares", { variant: "error" })
        return false
      }

      // Validar que haya al menos una actividad de horas extra con descripción
      if (timeEntry.overtimeActivities.some((activity) => !activity.description.trim())) {
        enqueueSnackbar("Todas las actividades de horas extra deben tener una descripción", { variant: "error" })
        return false
      }
    }

    return true
  }

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateTimeEntry()) {
      return
    }

    // Aquí iría la lógica para guardar las horas y actividades
    // En una aplicación real, esto enviaría los datos al servidor

    enqueueSnackbar("Horas registradas correctamente", { variant: "success" })
    setIsEditModalOpen(false)
    setEditingUser(null)

    // Actualizar la UI para reflejar que el usuario ya no tiene horas faltantes
    if (selectedDate) {
      setProjectsData((prevData) =>
        prevData.map((projectData) => ({
          ...projectData,
          entries: projectData.entries.map((entry) =>
            entry.date.getTime() === selectedDate.getTime()
              ? {
                ...entry,
                users: entry.users.filter((user) => user.id !== editingUser?.id),
              }
              : entry,
          ),
          // Recalcular el total de usuarios con horas faltantes
          totalUsersMissing: [
            ...new Set(
              projectData.entries.flatMap((e) =>
                e.date.getTime() === selectedDate.getTime()
                  ? e.users.filter((user) => user.id !== editingUser?.id)
                  : e.users,
              ),
            ),
          ].length,
        })),
      )
    }
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
                  {projectData.missingDays} días sin enviar
                </span>
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
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {projectData.entries.map((entry, index) => (
                    <div
                      key={index}
                      className={`p-2 text-center cursor-pointer ${selectedDate && entry.date.getTime() === selectedDate.getTime() ? "bg-violet-200" : "bg-red-100"
                        }`}
                      onClick={() => handleDateClick(entry.date)}
                    >
                      {format(entry.date, "d MMM", { locale: es })}
                    </div>
                  ))}
                </div>

                {selectedDate && (
                  <>
                    <div className="mt-4">
                      <h4 className="text-md font-semibold mb-2">
                        Usuarios sin registro el {format(selectedDate, "d MMMM yyyy", { locale: es })}:
                      </h4>
                      <ul className="divide-y">
                        {projectData.entries
                          .find((e) => e.date.getTime() === selectedDate.getTime())
                          ?.users.map((user) => (
                            <li key={user.id} className="flex justify-between items-center py-3">
                              <span>{user.name}</span>
                              <button
                                onClick={() => handleEditClick(user)}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm flex items-center"
                              >
                                <FaEdit className="mr-1" /> Registrar Horas
                              </button>
                            </li>
                          ))}
                      </ul>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-md font-semibold mb-2">Días sin enviar:</h4>
                      <ul className="divide-y">
                        {projectData.entries
                          .find((e) => e.date.getTime() === selectedDate.getTime())
                          ?.users.map((user) => (
                            <li key={user.id} className="flex justify-between items-center py-3">
                              <span>{user.name}</span>
                              <button
                                onClick={() => handleEditClick(user)}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm flex items-center"
                              >
                                <FaEdit className="mr-1" /> Editar Horas
                              </button>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Modal para registrar horas */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">
              Registrar horas para {editingUser.name} -{" "}
              {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: es })}
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Sección de horas regulares */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center text-violet-700">
                  <FaClock className="mr-2" /> Horas Regulares
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Inicio</label>
                    <input
                      type="time"
                      value={timeEntry.startTime}
                      onChange={(e) => handleTimeChange("startTime", e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Fin</label>
                    <input
                      type="time"
                      value={timeEntry.endTime}
                      onChange={(e) => handleTimeChange("endTime", e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Total Horas Regulares: <span className="font-bold">{timeEntry.regularHours.toFixed(2)}</span>
                    </label>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Actividades Realizadas</label>
                    <button
                      type="button"
                      onClick={handleAddActivity}
                      className="text-violet-600 hover:text-violet-800 text-sm flex items-center"
                    >
                      <FaPlus className="mr-1" /> Agregar Actividad
                    </button>
                  </div>

                  {timeEntry.activities.map((activity, index) => (
                    <div key={activity.id} className="flex items-center mb-2">
                      <textarea
                        value={activity.description}
                        onChange={(e) => handleActivityChange(activity.id, e.target.value)}
                        placeholder={`Actividad ${index + 1}`}
                        className="flex-grow p-2 border rounded mr-2"
                        rows={2}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveActivity(activity.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Eliminar actividad"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sección de horas extra */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center text-orange-700">
                  <FaClock className="mr-2" /> Horas Extra
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Inicio (Extra)</label>
                    <input
                      type="time"
                      value={timeEntry.overtimeStartTime}
                      onChange={(e) => handleTimeChange("overtimeStartTime", e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Fin (Extra)</label>
                    <input
                      type="time"
                      value={timeEntry.overtimeEndTime}
                      onChange={(e) => handleTimeChange("overtimeEndTime", e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Total Horas Extra:{" "}
                      <span className="font-bold">
                        {calculateHours(timeEntry.overtimeStartTime, timeEntry.overtimeEndTime).toFixed(2)}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Actividades Realizadas (Horas Extra)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddOvertimeActivity}
                      className="text-orange-600 hover:text-orange-800 text-sm flex items-center"
                    >
                      <FaPlus className="mr-1" /> Agregar Actividad
                    </button>
                  </div>

                  {timeEntry.overtimeActivities.map((activity, index) => (
                    <div key={activity.id} className="flex items-center mb-2">
                      <textarea
                        value={activity.description}
                        onChange={(e) => handleOvertimeActivityChange(activity.id, e.target.value)}
                        placeholder={`Actividad Extra ${index + 1}`}
                        className="flex-grow p-2 border rounded mr-2"
                        rows={2}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOvertimeActivity(activity.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Eliminar actividad"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="mr-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
                >
                  <FaCheck className="mr-2" /> Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

