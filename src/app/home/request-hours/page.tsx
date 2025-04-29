'use client'
import UserPage from "../components/UserPage"
import Link from "next/link"
import { FaClock, FaArrowLeft } from "react-icons/fa"
import dayjs from "dayjs"
import 'dayjs/locale/es'
import { useEffect, useState } from "react"
import { makeQuery } from "@/app/utils/api"
import { useSnackbar } from "notistack"
dayjs.locale("es")

interface WorkEntry {
  name: string
  date: string
  _id: string
  startTime: string
  endTime: string
  comments: string
  supervisorName: string
  overtime?: string
}

export default function RequestHoursPage() {
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([])
  const { enqueueSnackbar } = useSnackbar()

  const getWeekDays = () => {
    const startOfWeek = dayjs().startOf("week").add(-3, "day") // Lunes
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"))
  }

  const weekDays = getWeekDays()

  useEffect(() => {
    const token = localStorage.getItem("token");
    makeQuery(
      token,
      "getEntriesByDate",
      { date: selectedDate },
      enqueueSnackbar,
      (data: WorkEntry[]) => {
        setWorkEntries(data)
      }
    );
  }, [selectedDate]);

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

      <div className="p-4">
        <div className="flex items-start mb-5">
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

        {/* Project Cards */}
        <div className="space-y-4">
          {workEntries.map((entry, i) => (
            <div className="bg-[#EDEDED] rounded-2xl p-4 shadow-sm mb-4" key={i}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-[#55C157]" />
                <span className="text-gray-600 ml-4">
                  {entry._id.slice(0, 6)}
                </span>
                <div className="flex-1" />
                <span className="text-gray-600 text-sm">Responsable</span>
                <span className="bg-[#6A8D73] text-white text-xs px-2 py-2 rounded-full">
                  {entry.supervisorName.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <h1 className="font-bold text-gray-800">{entry.name}</h1>
              <p className="text-gray-600">
                {entry.comments}
              </p>

              <div className="space-y-2">
                {!entry.overtime && <Link href={`
                    /home/request-hours/add-hours?id=${entry._id}  
                  `} className="w-full flex bg-white text-green my-2 font-semibold items-center justify-center gap-2 border border-gray-200 rounded-lg py-2 px-4 hover:bg-gray-50 transition-colors">
                  <FaClock className="w-4 h-4" />
                  <span>Agregar horas</span>
                </Link>}

                {entry.overtime && <Link href={`
                /home/request-hours/status?id=${entry.overtime}  
                `} className="w-full flex bg-white text-green my-2 font-semibold items-center justify-center gap-2 border border-gray-200 rounded-lg py-2 px-4 hover:bg-gray-50 transition-colors" >
                  Ver Estado
                </Link>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </UserPage>
  )
}

