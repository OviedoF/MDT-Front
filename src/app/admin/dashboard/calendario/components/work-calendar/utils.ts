import type { DayData, UserDayData, HoursData } from "../../types"

export const getDayData = (day: string, calendarData: DayData[]): DayData => {

 // * Si el día es mayor a hoy 
  const today = new Date()
  const todayString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
  if (day > todayString) {
    return {
      date: day,
      totalHours: "0",
      extraHours: "0",
      status: "pending",
      sent: false,
    }
  }

  return calendarData.find((data) => data.date === day) || {
    date: day,
    totalHours: "0",
    extraHours: "0",
    status: "incomplete",
    sent: false,
  }
}

export const getTotalHours = (userEntries: UserDayData[]): HoursData => {
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

export const getDayColor = (dayData: DayData): string => {
  if (!dayData) return "bg-gray-200"

  switch (dayData.status) {
    case "complete":
      return "bg-green-200 hover:bg-green-300"
    case "incomplete":
      return "bg-red-200 hover:bg-red-300"
    case "sent":
      return "bg-blue-200 hover:bg-blue-300"
    case "pending":
      return "bg-yellow-200 hover:bg-yellow-300"
    default:
      return "bg-gray-200"
  }
}
