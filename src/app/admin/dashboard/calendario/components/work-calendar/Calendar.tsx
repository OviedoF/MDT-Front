"use client"
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth } from "date-fns"
import { es } from "date-fns/locale"
import { FaClock, FaCheck, FaTimes, FaPaperPlane } from "react-icons/fa"
import type { DayData } from "../../types"
import { getDayData, getDayColor, getTotalHours } from "./utils"

interface CalendarProps {
  currentDate: Date
  calendarData: DayData[]
  onDateClick: (date: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

export default function Calendar({ currentDate, calendarData, onDateClick, onPrevMonth, onNextMonth }: CalendarProps) {
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
      const formattedDay = format(day, "yyyy-MM-dd")
      const dayData = getDayData(formattedDay, calendarData)
      const { totalHours, extraHours } = dayData

      days.push(
        <div
          key={day.toString()}
          className={`p-2 border min-h-[80px] ${!isSameMonth(day, monthStart) ? "text-gray-400" : ""
            } ${!isSameMonth(day, monthStart) ? 'bg-gray-200' : getDayColor(dayData)} cursor-pointer`}
          onClick={() => onDateClick(formattedDay)}
        >
          <div className="flex justify-between items-start">
            <span className="font-bold">{format(day, "d")}</span>
            {dayData && (
              <div className="text-xs">
                {parseFloat(totalHours) > 0 && (
                  <div className="flex items-center">
                    <FaClock className="mr-1" size={10} />
                    <span>{parseFloat(totalHours).toFixed(1)}h</span>
                  </div>
                )}

                {parseFloat(extraHours) > 0 && (
                  <div className="flex items-center text-orange-600">
                    <FaClock className="mr-1" size={10} />
                    <span>{parseFloat(extraHours).toFixed(1)}h extra</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {isSameMonth(day, monthStart) && <>
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

            {dayData?.status === "pending" && (
              <div className="mt-1 text-yellow-600 text-xs flex items-center">
                <FaClock className="mr-1" size={10} />
                <span>Pendiente</span>
              </div>
            )}

            {dayData?.status === "missing-signatures" && (
              <div className="mt-1 text-orange-600 text-xs flex items-center">
                <FaClock className="mr-1" size={10} />
                <span>Firmas pendientes</span>
              </div>
            )}
          </>}
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
        <button onClick={onPrevMonth} className="p-2 bg-violet-100 hover:bg-violet-200 rounded">
          &lt;
        </button>
        <h2 className="text-xl font-bold">{format(currentDate, "MMMM yyyy", { locale: es })}</h2>
        <button onClick={onNextMonth} className="p-2 bg-violet-100 hover:bg-violet-200 rounded">
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">{daysOfWeek}</div>
      {rows}
    </div>
  )
}
