"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaSignOutAlt, FaUser, FaClock } from "react-icons/fa"
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
}

interface WorkEntry {
  userId: number
  date: Date
  hours: number
  infoCompleted: boolean
}

const users: User[] = [
  { id: 1, name: "Juan Pérez" },
  { id: 2, name: "María García" },
  { id: 3, name: "Carlos López" },
]

// Función para generar datos de ejemplo
const generateWorkEntries = (startDate: Date, endDate: Date): WorkEntry[] => {
  const entries: WorkEntry[] = []
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  days.forEach((day) => {
    users.forEach((user) => {
      if (Math.random() > 0.1) {
        // 90% de probabilidad de que un usuario trabaje en un día
        entries.push({
          userId: user.id,
          date: day,
          hours: Math.floor(Math.random() * 8) + 1,
          infoCompleted: Math.random() > 0.2, // 80% de probabilidad de que la información esté completa
        })
      }
    })
  })

  return entries
}

export default function WorkCalendarPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<"month" | "week">("month")
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([])

  useEffect(() => {
    const startDate = viewMode === "month" ? startOfMonth(currentDate) : startOfWeek(currentDate)
    const endDate = viewMode === "month" ? endOfMonth(currentDate) : addDays(startDate, 6)
    setWorkEntries(generateWorkEntries(startDate, endDate))
  }, [currentDate, viewMode])

  const getDaysToShow = () => {
    if (viewMode === "month") {
      return eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
      })
    } else {
      const start = startOfWeek(currentDate)
      return Array.from({ length: 7 }, (_, i) => addDays(start, i))
    }
  }

  const getDayColor = (day: Date) => {
    const dayEntries = workEntries.filter((entry) => isSameDay(entry.date, day))
    if (dayEntries.length === 0) return "bg-gray-200"
    return dayEntries.every((entry) => entry.infoCompleted) ? "bg-green-200" : "bg-red-200"
  }

  const handleDateClick = (day: Date) => {
    setSelectedDate(day)
  }

  const getDayDetails = (day: Date) => {
    return workEntries.filter((entry) => isSameDay(entry.date, day))
  }

  return (
    <main className="bg-violet-100 w-full min-h-screen">
      <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Calendario de Trabajo</h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center bg-violet-700 hover:bg-violet-800 px-4 py-2 rounded-md transition duration-300"
        >
          <FaSignOutAlt className="mr-2" />
          Dashboard
        </button>
      </header>

      <section className="p-4">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {format(currentDate, viewMode === "month" ? "MMMM yyyy" : "'Semana del' d 'de' MMMM", { locale: es })}
            </h2>
            <div className="space-x-2">
              <button
                onClick={() => setViewMode("month")}
                className={`px-4 py-2 rounded ${viewMode === "month" ? "bg-violet-600 text-white" : "bg-gray-200"}`}
              >
                Mes
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-4 py-2 rounded ${viewMode === "week" ? "bg-violet-600 text-white" : "bg-gray-200"}`}
              >
                Semana
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {getDaysToShow().map((day, index) => (
              <div
                key={index}
                className={`p-2 text-center cursor-pointer ${getDayColor(day)} ${
                  isSameMonth(day, currentDate) ? "" : "text-gray-400"
                }`}
                onClick={() => handleDateClick(day)}
              >
                {format(day, "d")}
              </div>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-4">
              Detalle del {format(selectedDate, "d 'de' MMMM", { locale: es })}
            </h3>
            <div className="space-y-4">
              {getDayDetails(selectedDate).map((entry, index) => (
                <div key={index} className="flex items-center space-x-4 p-2 bg-gray-100 rounded">
                  <FaUser className="text-violet-600" />
                  <span className="font-medium">{users.find((u) => u.id === entry.userId)?.name}</span>
                  <FaClock className="text-violet-600" />
                  <span>{entry.hours} horas</span>
                  <span className={entry.infoCompleted ? "text-green-500" : "text-red-500"}>
                    {entry.infoCompleted ? "Información completa" : "Información incompleta"}
                  </span>
                </div>
              ))}
              {getDayDetails(selectedDate).length === 0 && <p>No hay registros de trabajo para este día.</p>}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

