"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSnackbar } from "notistack"
import {
  FaSignOutAlt,
  FaUser,
  FaClock,
  FaPaperPlane,
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaComments,
  FaEdit,
  FaPlus,
  FaTrash,
  FaFilePdf,
  FaEnvelope,
} from "react-icons/fa"
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns"
import { es } from "date-fns/locale"

interface User {
  id: number
  name: string
  role: string
}

interface Activity {
  id: number
  userId: number
  description: string
  comments: string
}

interface UserDayData {
  userId: number
  startTime: string
  endTime: string
  activities: Activity[]
  comments: string
  isComplete: boolean
}

interface DayData {
  date: Date
  status: "incomplete" | "complete" | "sent"
  userEntries: UserDayData[]
}

interface Project {
  id: number
  name: string
  supervisor: {
    id: number
    name: string
    email: string
  }
}

const users: User[] = [
  { id: 1, name: "Juan Pérez", role: "Topógrafo" },
  { id: 2, name: "María García", role: "Colaborador" },
  { id: 3, name: "Carlos López", role: "Topógrafo" },
]

const projects: Project[] = [
  {
    id: 1,
    name: "Proyecto A",
    supervisor: { id: 1, name: "Roberto Gómez", email: "roberto@example.com" },
  },
  {
    id: 2,
    name: "Proyecto B",
    supervisor: { id: 2, name: "Laura Sánchez", email: "laura@example.com" },
  },
]

// Función para generar datos de ejemplo
const generateCalendarData = (currentMonth: Date): DayData[] => {
  const startDate = startOfMonth(currentMonth)
  const endDate = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  return days.map((day, index) => {
    // Generar estado basado en el día del mes para tener una distribución predecible
    let status: "incomplete" | "complete" | "sent"

    // Primeros 10 días: mayoría incompletos
    if (day.getDate() < 10) {
      status = day.getDate() % 3 === 0 ? "complete" : "incomplete"
    }
    // Siguientes 10 días: mayoría completos
    else if (day.getDate() < 20) {
      status = day.getDate() % 5 === 0 ? "incomplete" : "complete"
    }
    // Últimos días: algunos enviados
    else {
      status = day.getDate() % 7 === 0 ? "sent" : day.getDate() % 5 === 0 ? "incomplete" : "complete"
    }

    // Generar entradas de usuario para cada día
    const userEntries: UserDayData[] = users.map((user) => {
      // Determinar si este usuario tiene datos completos o no
      // Para días incompletos, asegurar que al menos un usuario esté incompleto
      const isComplete =
        status === "incomplete" ? user.id !== users[day.getDate() % users.length].id : status !== "incomplete"

      // Generar horarios realistas
      const startTime = isComplete ? "08:00" : ""
      const endTime = isComplete ? "17:00" : ""

      // Generar actividades con datos significativos
      const activities: Activity[] = []
      const activityCount = isComplete ? Math.floor(Math.random() * 2) + 2 : 0 // 2-3 actividades para completos

      const activityTemplates = [
        "Levantamiento topográfico en sector norte",
        "Medición de terreno para proyecto residencial",
        "Calibración de equipos de medición",
        "Análisis de datos recolectados",
        "Elaboración de planos preliminares",
        "Reunión con cliente para revisión de avances",
        "Verificación de linderos en propiedad",
        "Estudio de suelo en área de construcción",
      ]

      const commentTemplates = [
        "Se completó satisfactoriamente",
        "Hubo retrasos por condiciones climáticas",
        "Se requiere revisión adicional",
        "Cliente satisfecho con los resultados",
        "Se encontraron discrepancias con mediciones previas",
        "Trabajo completado antes de lo previsto",
      ]

      for (let i = 0; i < activityCount; i++) {
        activities.push({
          id: i + 1,
          userId: user.id,
          description: activityTemplates[Math.floor(Math.random() * activityTemplates.length)],
          comments: commentTemplates[Math.floor(Math.random() * commentTemplates.length)],
        })
      }

      // Generar comentarios generales
      const commentOptions = [
        "Jornada productiva sin contratiempos.",
        "Se cumplieron todos los objetivos planificados para el día.",
        "Hubo algunos retrasos debido al tráfico en la mañana.",
        "El equipo trabajó eficientemente y se adelantaron tareas del día siguiente.",
        "Se requiere mantenimiento para algunos equipos utilizados hoy.",
        "",
      ]

      return {
        userId: user.id,
        startTime,
        endTime,
        activities,
        comments: isComplete ? commentOptions[Math.floor(Math.random() * commentOptions.length)] : "",
        isComplete,
      }
    })

    return {
      date: day,
      status,
      userEntries,
    }
  })
}

export default function WorkCalendarPage() {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [calendarData, setCalendarData] = useState<DayData[]>([])
  const [selectedProject, setSelectedProject] = useState<number>(1)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserDayData | null>(null)

  useEffect(() => {
    // Generar datos de calendario para el mes actual
    setCalendarData(generateCalendarData(currentDate))
  }, [currentDate])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    setSelectedDate(null)
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    setSelectedDate(null)
  }

  const handleDateClick = (day: Date) => {
    setSelectedDate(day)
  }

  const getDayColor = (dayData: DayData | undefined) => {
    if (!dayData) return "bg-gray-200"

    switch (dayData.status) {
      case "complete":
        return "bg-green-200 hover:bg-green-300"
      case "incomplete":
        return "bg-red-200 hover:bg-red-300"
      case "sent":
        return "bg-blue-200 hover:bg-blue-300"
      default:
        return "bg-gray-200"
    }
  }

  const getDayData = (day: Date) => {
    return calendarData.find((data) => isSameDay(data.date, day))
  }

  const getTotalHours = (userEntries: UserDayData[]) => {
    let normalHours = 0
    let overtimeHours = 0

    userEntries.forEach((entry) => {
      if (entry.startTime && entry.endTime) {
        const start = new Date(`2000-01-01T${entry.startTime}:00`)
        const end = new Date(`2000-01-01T${entry.endTime}:00`)
        const diffMs = end.getTime() - start.getTime()
        const hours = Math.max(0, diffMs / (1000 * 60 * 60))

        // Para datos de prueba más interesantes, asignar algunas horas extra
        if (entry.userId % 2 === 0) {
          normalHours += Math.min(8, hours)
          overtimeHours += Math.max(0, hours - 8)
        } else {
          normalHours += hours
        }
      }
    })

    return { normalHours, overtimeHours }
  }

  const handleSendReport = () => {
    if (!selectedDate) {
      enqueueSnackbar("Por favor, selecciona un día para enviar el informe", { variant: "warning" })
      return
    }

    setIsReportModalOpen(true)
  }

  const handleShowPdfPreview = () => {
    if (!selectedDate) {
      enqueueSnackbar("Por favor, selecciona un día para generar el informe", { variant: "warning" })
      return
    }

    setIsPdfPreviewOpen(true)
  }

  const confirmSendReport = () => {
    if (!selectedDate) return

    // Actualizar el estado del día a "enviado"
    setCalendarData((prevData) =>
      prevData.map((day) => (isSameDay(day.date, selectedDate) ? { ...day, status: "sent" } : day)),
    )

    setIsReportModalOpen(false)
    setIsPdfPreviewOpen(false)
    enqueueSnackbar("Informe enviado correctamente", { variant: "success" })
  }

  const handleEditUser = (userEntry: UserDayData) => {
    setEditingUser({
      ...userEntry,
      activities:
        userEntry.activities.length > 0
          ? userEntry.activities.map((activity) => ({ ...activity }))
          : [{ id: Date.now(), userId: userEntry.userId, description: "", comments: "" }],
    })
    setIsEditModalOpen(true)
  }

  const handleAddActivity = () => {
    if (!editingUser) return

    const newActivity = {
      id: Date.now(),
      userId: editingUser.userId,
      description: "",
      comments: "",
    }

    setEditingUser({
      ...editingUser,
      activities: [...editingUser.activities, newActivity],
    })
  }

  const handleRemoveActivity = (activityId: number) => {
    if (!editingUser) return

    if (editingUser.activities.length <= 1) {
      enqueueSnackbar("Debe haber al menos una actividad", { variant: "warning" })
      return
    }

    setEditingUser({
      ...editingUser,
      activities: editingUser.activities.filter((activity) => activity.id !== activityId),
    })
  }

  const handleActivityChange = (activityId: number, field: keyof Activity, value: string) => {
    if (!editingUser) return

    setEditingUser({
      ...editingUser,
      activities: editingUser.activities.map((activity) =>
        activity.id === activityId ? { ...activity, [field]: value } : activity,
      ),
    })
  }

  const handleEditUserChange = (field: keyof UserDayData, value: any) => {
    if (!editingUser) return

    setEditingUser({
      ...editingUser,
      [field]: value,
    })
  }

  const handleSaveUserEdit = () => {
    if (!editingUser || !selectedDate) return

    // Validar que los campos requeridos estén completos
    if (!editingUser.startTime || !editingUser.endTime) {
      enqueueSnackbar("Los horarios de entrada y salida son obligatorios", { variant: "error" })
      return
    }

    // Validar que las actividades tengan descripción
    if (editingUser.activities.some((activity) => !activity.description.trim())) {
      enqueueSnackbar("Todas las actividades deben tener una descripción", { variant: "error" })
      return
    }

    // Actualizar los datos del calendario
    setCalendarData((prevData) =>
      prevData.map((day) => {
        if (isSameDay(day.date, selectedDate)) {
          const updatedUserEntries = day.userEntries.map((entry) =>
            entry.userId === editingUser.userId ? { ...editingUser, isComplete: true } : entry,
          )

          // Verificar si todos los usuarios están completos para actualizar el estado del día
          const allComplete = updatedUserEntries.every((entry) => entry.isComplete)

          return {
            ...day,
            userEntries: updatedUserEntries,
            status: allComplete ? "complete" : "incomplete",
          }
        }
        return day
      }),
    )

    setIsEditModalOpen(false)
    setEditingUser(null)
    enqueueSnackbar("Información actualizada correctamente", { variant: "success" })
  }

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart, { locale: es })
    const endDate = startOfWeek(addDays(monthEnd, 7), { locale: es })

    const dateFormat = "EEEE"
    const rows = []
    let days = []

    // Crear encabezados de días de la semana
    const daysOfWeek = []
    let day = startDate
    for (let i = 0; i < 7; i++) {
      daysOfWeek.push(
        <div key={i} className="text-center font-semibold py-2">
          {format(day, dateFormat, { locale: es })}
        </div>,
      )
      day = addDays(day, 1)
    }

    // Reiniciar para generar el calendario
    day = startDate

    // Generar filas del calendario
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day)
        const dayData = getDayData(cloneDay)
        const { normalHours, overtimeHours } = dayData
          ? getTotalHours(dayData.userEntries)
          : { normalHours: 0, overtimeHours: 0 }

        days.push(
          <div
            key={day.toString()}
            className={`p-2 border min-h-[80px] ${
              !isSameMonth(day, monthStart) ? "text-gray-400" : ""
            } ${getDayColor(dayData)} cursor-pointer`}
            onClick={() => handleDateClick(cloneDay)}
          >
            <div className="flex justify-between items-start">
              <span className="font-bold">{format(day, "d")}</span>
              {dayData && (
                <div className="text-xs">
                  {normalHours > 0 && (
                    <div className="flex items-center">
                      <FaClock className="mr-1" size={10} />
                      <span>{normalHours.toFixed(1)}h</span>
                    </div>
                  )}
                  {overtimeHours > 0 && (
                    <div className="flex items-center text-orange-600">
                      <FaClock className="mr-1" size={10} />
                      <span>{overtimeHours.toFixed(1)}h extra</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {dayData?.status === "complete" && (
              <div className="mt-1 text-green-600 text-xs flex items-center">
                <FaCheck className="mr-1" size={10} />
                <span>Completo</span>
              </div>
            )}
            {dayData?.status === "incomplete" && (
              <div className="mt-1 text-red-600 text-xs flex items-center">
                <FaTimes className="mr-1" size={10} />
                <span>Incompleto</span>
              </div>
            )}
            {dayData?.status === "sent" && (
              <div className="mt-1 text-blue-600 text-xs flex items-center">
                <FaPaperPlane className="mr-1" size={10} />
                <span>Enviado</span>
              </div>
            )}
          </div>,
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>,
      )
      days = []
    }

    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <button onClick={handlePrevMonth} className="p-2 bg-violet-100 hover:bg-violet-200 rounded">
            &lt;
          </button>
          <h2 className="text-xl font-bold">{format(currentDate, "MMMM yyyy", { locale: es })}</h2>
          <button onClick={handleNextMonth} className="p-2 bg-violet-100 hover:bg-violet-200 rounded">
            &gt;
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">{daysOfWeek}</div>
        {rows}
      </div>
    )
  }

  const renderDayDetail = () => {
    if (!selectedDate) return null

    const dayData = getDayData(selectedDate)
    if (!dayData) return null

    const { normalHours, overtimeHours } = getTotalHours(dayData.userEntries)
    const incompleteUsers = dayData.userEntries.filter((entry) => !entry.isComplete)

    return (
      <div className="bg-white p-4 rounded-lg shadow-md mt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Detalle del {format(selectedDate, "d 'de' MMMM", { locale: es })}</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleShowPdfPreview}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <FaFilePdf className="mr-2" />
              Ver PDF
            </button>
            <button
              onClick={handleSendReport}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
              disabled={dayData.status === "sent"}
            >
              <FaPaperPlane className="mr-2" />
              {dayData.status === "sent" ? "Informe Enviado" : "Enviar Informe"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-green-100 p-3 rounded-lg">
            <h4 className="font-semibold flex items-center">
              <FaClock className="mr-2" />
              Horas Normales
            </h4>
            <p className="text-2xl font-bold">{normalHours.toFixed(1)}</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-lg">
            <h4 className="font-semibold flex items-center">
              <FaClock className="mr-2" />
              Horas Extra
            </h4>
            <p className="text-2xl font-bold">{overtimeHours.toFixed(1)}</p>
          </div>
        </div>

        {incompleteUsers.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2 text-red-600 flex items-center">
              <FaTimes className="mr-2" />
              Usuarios con Información Incompleta
            </h4>
            <div className="bg-red-50 p-3 rounded-lg">
              {incompleteUsers.map((entry) => {
                const user = users.find((u) => u.id === entry.userId)
                return (
                  <div key={entry.userId} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span>
                      {user?.name} ({user?.role})
                    </span>
                    <button
                      onClick={() => handleEditUser(entry)}
                      className="bg-blue-500 hover:bg-blue-700 text-white text-sm py-1 px-2 rounded flex items-center"
                    >
                      <FaEdit className="mr-1" /> Editar
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <h4 className="font-semibold mb-2 flex items-center">
          <FaUser className="mr-2" />
          Actividades del Equipo
        </h4>

        {dayData.userEntries
          .filter((entry) => entry.isComplete)
          .map((entry) => {
            const user = users.find((u) => u.id === entry.userId)
            return (
              <div key={entry.userId} className="border p-3 rounded-lg mb-3">
                <div className="flex justify-between">
                  <span className="font-medium">
                    {user?.name} ({user?.role})
                  </span>
                  <div className="text-sm">
                    <span className="mr-2">
                      {entry.startTime} - {entry.endTime}
                    </span>
                    <button onClick={() => handleEditUser(entry)} className="text-blue-500 hover:text-blue-700">
                      <FaEdit />
                    </button>
                  </div>
                </div>

                {entry.activities.map((activity) => (
                  <div key={activity.id} className="mt-2 pl-4 border-l-2 border-gray-200">
                    <p className="font-medium">{activity.description}</p>
                    {activity.comments && <p className="text-sm text-gray-600 mt-1">{activity.comments}</p>}
                  </div>
                ))}

                {entry.comments && (
                  <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <div className="flex items-start">
                      <FaComments className="mr-2 mt-1" />
                      <span>{entry.comments}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
      </div>
    )
  }

  return (
    <main className="bg-violet-100 w-full min-h-screen">
      <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Calendario de Trabajo</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center bg-violet-700 hover:bg-violet-800 px-4 py-2 rounded-md transition duration-300"
        >
          <FaSignOutAlt className="mr-2" />
          Dashboard
        </button>
      </header>

      <section className="p-4">
        <div className="mb-4 bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <FaCalendarAlt className="text-violet-600 mr-2" />
            <h2 className="text-xl font-bold">Calendario de Actividades</h2>
          </div>

          <div className="mb-4">
            <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Proyecto
            </label>
            <select
              id="project"
              value={selectedProject}
              onChange={(e) => setSelectedProject(Number(e.target.value))}
              className="w-full md:w-64 p-2 border rounded"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-200 mr-1 rounded"></div>
              <span className="text-sm">Completo</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-200 mr-1 rounded"></div>
              <span className="text-sm">Incompleto</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-200 mr-1 rounded"></div>
              <span className="text-sm">Informe Enviado</span>
            </div>
          </div>
        </div>

        {renderCalendar()}
        {renderDayDetail()}
      </section>

      {/* Modal de confirmación para enviar informe */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Confirmar Envío de Informe</h3>
            <p>
              ¿Estás seguro de que deseas enviar el informe del día{" "}
              {selectedDate && format(selectedDate, "d 'de' MMMM", { locale: es })} al supervisor del proyecto?
            </p>
            <p className="mt-2 text-sm">
              Se enviará a:{" "}
              <span className="font-medium">{projects.find((p) => p.id === selectedProject)?.supervisor.email}</span>
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={confirmSendReport}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Enviar
              </button>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar información de usuario */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">
              Editar Información - {users.find((u) => u.id === editingUser.userId)?.name}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Entrada</label>
                  <input
                    type="time"
                    value={editingUser.startTime}
                    onChange={(e) => handleEditUserChange("startTime", e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Salida</label>
                  <input
                    type="time"
                    value={editingUser.endTime}
                    onChange={(e) => handleEditUserChange("endTime", e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Actividades</label>
                  <button
                    type="button"
                    onClick={handleAddActivity}
                    className="text-violet-600 hover:text-violet-800 text-sm flex items-center"
                  >
                    <FaPlus className="mr-1" /> Agregar Actividad
                  </button>
                </div>

                {editingUser.activities.map((activity, index) => (
                  <div key={activity.id} className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <label className="block text-sm font-medium text-gray-700">Actividad {index + 1}</label>
                      <button
                        type="button"
                        onClick={() => handleRemoveActivity(activity.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={activity.description}
                      onChange={(e) => handleActivityChange(activity.id, "description", e.target.value)}
                      placeholder="Descripción de la actividad"
                      className="w-full p-2 border rounded mb-2"
                      required
                    />
                    <textarea
                      value={activity.comments}
                      onChange={(e) => handleActivityChange(activity.id, "comments", e.target.value)}
                      placeholder="Comentarios (opcional)"
                      className="w-full p-2 border rounded"
                      rows={2}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios Generales</label>
                <textarea
                  value={editingUser.comments}
                  onChange={(e) => handleEditUserChange("comments", e.target.value)}
                  placeholder="Comentarios generales sobre el día de trabajo"
                  className="w-full p-2 border rounded"
                  rows={3}
                />
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
                  type="button"
                  onClick={handleSaveUserEdit}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
                >
                  <FaCheck className="mr-2" /> Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para vista previa del PDF */}
      {isPdfPreviewOpen && selectedDate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Vista Previa del Informe PDF</h3>
              <button onClick={() => setIsPdfPreviewOpen(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg border border-gray-300 max-h-[70vh] overflow-y-auto">
              {/* Simulación de PDF */}
              <div className="bg-white p-8 shadow-md">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold">Informe de Actividades</h2>
                  <h3 className="text-xl">{projects.find((p) => p.id === selectedProject)?.name}</h3>
                  <p className="text-gray-600">
                    {selectedDate && format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-bold border-b pb-2 mb-3">Resumen de Horas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Horas Normales:</p>
                      <p className="text-xl">
                        {getTotalHours(getDayData(selectedDate)?.userEntries || []).normalHours.toFixed(1)} horas
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Horas Extra:</p>
                      <p className="text-xl">
                        {getTotalHours(getDayData(selectedDate)?.userEntries || []).overtimeHours.toFixed(1)} horas
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-bold border-b pb-2 mb-3">Colaboradores</h4>

                  {getDayData(selectedDate)
                    ?.userEntries.filter((entry) => entry.isComplete)
                    .map((entry) => {
                      const user = users.find((u) => u.id === entry.userId)
                      return (
                        <div key={entry.userId} className="mb-6 pb-4 border-b last:border-0">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-bold">{user?.name}</h5>
                            <span className="text-sm">{user?.role}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm font-medium">Hora de Entrada:</p>
                              <p>{entry.startTime}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Hora de Salida:</p>
                              <p>{entry.endTime}</p>
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Actividades Realizadas:</p>
                            <ul className="list-disc pl-5">
                              {entry.activities.map((activity) => (
                                <li key={activity.id} className="mb-1">
                                  {activity.description}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {entry.comments && (
                            <div>
                              <p className="text-sm font-medium mb-1">Comentarios:</p>
                              <p className="text-sm bg-gray-50 p-2 rounded">{entry.comments}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={confirmSendReport}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
              >
                <FaEnvelope className="mr-2" /> Enviar por Email
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

