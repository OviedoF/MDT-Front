"use client"
import React, { useState, useEffect, Suspense } from "react"
import UserPage from "../components/UserPage"
import Link from "next/link"
import { BsEye } from "react-icons/bs"
import dayjs from "dayjs"
import 'dayjs/locale/es'
import { useSearchParams } from "next/navigation"
import { makeQuery } from "@/app/utils/api"
import { useSnackbar } from "notistack"
dayjs.locale("es")

const dayNames: any = {
  "sábado": "saturday",
  "domingo": "sunday",
  "lunes": "monday",
  "martes": "tuesday",
  "miércoles": "wednesday",
  "jueves": "thursday",
  "viernes": "friday",
}

interface WorkEntry {
  _id: string
  name: string
  date: string
  startTime: string
  endTime: string
  topographerSignature: string
  supervisorSignature: string
}

interface Project {
  _id: string
  startDate: string
  endDate: string
  startHour: string
  endHour: string
}

const getTimeDiff = (start: string, end: string) => {
  const [startHour, startMinute] = start.split(':').map(Number)
  const [endHour, endMinute] = end.split(':').map(Number)

  const startInMinutes = startHour * 60 + startMinute
  const endInMinutes = endHour * 60 + endMinute

  const diff = endInMinutes - startInMinutes

  if (diff < 0) return '0 h 0 m' // En caso de hora inválida

  const hours = Math.floor(diff / 60)
  const minutes = diff % 60

  return `${hours} h${minutes !== 0 ? ` ${minutes} m` : "s"
    }` // Formato de salida: "X h Y m"
}

const getTotalHours = (entries: WorkEntry[]) => {
  const totalMinutes = entries.reduce((acc, entry) => {
    const [startHour, startMinute] = entry.startTime.split(':').map(Number)
    const [endHour, endMinute] = entry.endTime.split(':').map(Number)

    const startInMinutes = startHour * 60 + startMinute
    const endInMinutes = endHour * 60 + endMinute

    return acc + (endInMinutes - startInMinutes)
  }, 0)

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${hours} horas ${minutes} minutos`
}

function Content() {
  // Estado para el día seleccionado
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [entries, setEntries] = useState<WorkEntry[]>([])
  const [projectData, setProjectData] = useState<Project | null>(null)
  const searchParams = useSearchParams()
  const project = searchParams.get("project")
  const { enqueueSnackbar } = useSnackbar()

  // Obtener la semana actual (lunes a domingo)
const getWeekDays = () => {
  const today = dayjs()
  return Array.from({ length: 7 }, (_, i) => today.subtract(6 - i, "day"))
}

  const weekDays = getWeekDays()

  const selectedDateFormatted = selectedDate.format("YYYY-MM-DD")

  const getDayEntries = () => {
    makeQuery(
      localStorage.getItem("token"),
      'getWorkEntries',
      { date: selectedDateFormatted, project },
      enqueueSnackbar,
      (response) => {
        setEntries(response)
      },
    )
  }

  const getProjectData = () => {
    makeQuery(
      localStorage.getItem("token"),
      'getProject',
      project || '',
      enqueueSnackbar,
      (response) => {
        const selectedWorkSchedule = response.workSchedule[dayNames[selectedDate.format("dddd")]] || {
          startTime: "00:00",
          endTime: "00:00",
        }

        setProjectData({
          _id: response._id,
          startDate: response.startDate,
          endDate: response.endDate,
          startHour: selectedWorkSchedule.startTime,
          endHour: selectedWorkSchedule.endTime,
        })
      },
    )
  }

  useEffect(() => {
    getDayEntries()
    getProjectData()
  }, [selectedDate])

  return (
    <UserPage>
      <div className="flex items-center justify-between p-2 px-10 bg-[#EDEDED]">
        <div className="flex items-center">
          <span className="text-5xl font-bold text-gray-700">{selectedDate.date()}</span>
          <div className="ml-2 flex flex-col">
            <span className="text-sm font-medium capitalize">
              {selectedDate.format("dddd")}
            </span>
            <span className="text-xs text-gray-600 capitalize">
              {selectedDate.format("MMMM YYYY")}
            </span>
          </div>
        </div>
        <div className="ml-3">
          <span className="bg-[#6981677A] text-md font-bold text-[#698167] px-3 py-1 rounded-sm">
            {selectedDate.isSame(dayjs(), "day") ? "Hoy" : "Seleccionado"}
          </span>
        </div>
      </div>

      <div className="p-4 pb-24">
        {/* Project Header */}
        <div className="rounded-2xl shadow-sm mb-4">
          <div className="flex items-start">
            <div className="flex-1">
              <div className="mt-3 flex">
                <div className="grid grid-cols-7 w-full text-md text-center">
                  {weekDays.map((day, i) => (
                    <div
                      key={i}
                      className={`cursor-pointer rounded-md p-1 transition-all ${day.isSame(selectedDate, "day")
                        ? "bg-[#6A8D73] text-white"
                        : "text-gray-700 hover:bg-gray-200"
                        }`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className="text-sm mb-1 font-semibold">
                        {day.format("dd")[0].toUpperCase()}
                      </div>
                      <div className="text-md">{day.date()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Today hours total */}
          <p className="text-sm text-center mb-2 mt-5">
            Horas esperadas: {projectData?.startHour} - {projectData?.endHour}
          </p>

          {entries.length === 0 && <Link href={`
          /home/add-hours/add-activity?date=${selectedDate.format("YYYY-MM-DD")}&project=${project}
        `}>
            <button className="mt-2 w-full bg-[#4A4A4A] text-white py-3 rounded-md font-medium">Agregar Actividades</button>
          </Link>}
        </div>

        {/* Total Hours */}
        <div className="bg-gray-100 rounded-lg p-4 px-6 mb-4 flex justify-between items-center">
          <div className="text-gray-600 text-sm">Total de Horas</div>
          <div className="text-[#698167] font-bold">
            {getTotalHours(entries)}
          </div>
        </div>

        {/* Daily Entry */}
        {entries.map((entry, index) => (
          <div className="space-y-4 mt-4" key={index}>
            <div className="flex flex-col">
              <div className="flex justify-between items-center">
                <p className="font-semibold capitalize">
                  {entry.name}
                </p>

                <span className="bg-[#F5F5F5] font-semibold py-3 px-8 rounded-sxl">
                  {getTimeDiff(entry.startTime, entry.endTime)}
                </span>
              </div>

              {(!entry.topographerSignature || !entry.supervisorSignature) && (
                <div className="bg-red-100 rounded-lg p-4 px-6 mt-4 flex justify-between items-center">
                  <div className="text-gray-800 text-sm">
                    {entry.topographerSignature ? "Falta firma del supervisor" : "Falta firma del topógrafo"}
                  </div>
                  <Link
                    href={`/home/add-hours/entry-detail?entryId=${entry._id}`}
                    className="bg-[#698167] text-white py-2 px-4 rounded-md font-medium"
                  >
                    Firmar
                  </Link>
                </div>
              )}

              <Link
                href={`/home/add-hours/entry-detail?entryId=${entry._id}`}
                className="border-green border-2 py-2 w-full text-green font-semibold flex items-center justify-center gap-2 rounded-xl mt-4"
              >
                <BsEye className="text-green" />
                Ver detalle
              </Link>
            </div>
          </div>
        ))}
      </div>
    </UserPage >
  )
}

export default function Page() {
  return (
    <Suspense>
      <Content />
    </Suspense>
  )
}
