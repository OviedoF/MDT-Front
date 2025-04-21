"use client"

import { useEffect, useState } from "react"
import UserPage from "../components/UserPage"
import { FaCheck, FaTimes, FaChevronDown, FaChevronUp, FaExchangeAlt } from "react-icons/fa"
import dayjs from "dayjs"
import "dayjs/locale/es"
import { makeQuery } from "@/app/utils/api"
import { enqueueSnackbar } from "notistack"
dayjs.locale("es")

type ViewMode = "projects" | "summary"

interface Project {
  _id: string
  name: string
  description: string
  percent: number
  collaborators: Member[]
}

interface Member {
  _id: string
  name: string
  hoursWorked: number
}

interface DayData {
  activeProjects: number
  totalCollaborators: number
  collaboratorsCompleted: number
}

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("projects")
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [dayData, setDayData] = useState<DayData>({
    activeProjects: 0,
    totalCollaborators: 0,
    collaboratorsCompleted: 0,
  })
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedProject, setExpandedProject] = useState<string | null>(null)

  useEffect(() => {
    makeQuery(
      localStorage.getItem('token'),
      'getUserProjectsControl',
      {
        selectedDate: selectedDate.format("YYYY-MM-DD"),
      },
      enqueueSnackbar,
      (response: Project[]) => {
        setProjects(response)
      },
    )
  }, [selectedDate])

  useEffect(() => {
    if (viewMode === "projects") {
      makeQuery(
        localStorage.getItem('token'),
        'getUserProjectsControl',
        {
          selectedDate: selectedDate.format("YYYY-MM-DD"),
        },
        enqueueSnackbar,
        (response: Project[]) => {
          setProjects(response)
        },
      )
    }

    if (viewMode === "summary") {
      makeQuery(
        localStorage.getItem('token'),
        'getDaySummary',
        {
          selectedDate: selectedDate.format("YYYY-MM-DD"),
        },
        enqueueSnackbar,
        (response: DayData) => {
          setDayData(response)
        },
      )
    }
  }, [viewMode])

  const getWeekDays = () => {
    const startOfWeek = dayjs().startOf("week").add(-6, "day") // Lunes
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"))
  }

  const weekDays = getWeekDays()

  const toggleProjectExpansion = (projectId: string) => {
    if (expandedProject === projectId) {
      setExpandedProject(null)
    } else {
      setExpandedProject(projectId)
    }
  }

  const toggleViewMode = () => {
    setViewMode(viewMode === "projects" ? "summary" : "projects")
  }

  const getCompletionColor = (percent: number) => {
    if (percent >= 50) return "text-green-500 bg-[#E8F5E6]"
    return "text-red-400 bg-[#FAE4DE]"
  }

  const renderCalendarWeek = () => {
    const days = ["L", "M", "X", "J", "V", "S", "D"]
    const dates = [24, 25, 26, 27, 28, 29, 30]

    return (
      <div className="rounded-2xl mb-4">
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
      </div>
    )
  }

  const renderProjects = () => {
    return (
      <div className="space-y-3">
        {projects.map((project) => (
          <div key={project._id} className="bg-[#EDEDED] rounded-xl overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-gray-600 text-sm">{
                    project._id.slice(0, 5).toUpperCase()
                  }</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`${getCompletionColor(project.percent)} px-2 py-2 rounded-lg text-[12px] font-semibold`}>
                    {project.percent}% Completado
                  </span>

                  <button
                    className="w-6 h-6 rounded-full border-[#525252] border-2 flex items-center justify-center"
                    onClick={() => toggleProjectExpansion(project._id)}
                  >
                    {expandedProject === project._id ? (
                      <FaChevronUp className="w-3 h-3 text-gray-600" />
                    ) : (
                      <FaChevronDown className="w-3 h-3 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-medium font-semibold text-gray-800">{project.name}</h3>
                <p className="text-gray-600 text-sm">{project.description}</p>
              </div>
            </div>

            {expandedProject === project._id && (
              <div className="p-4 border-t border-gray-200 space-y-4">
                {project.collaborators.map((member) => (
                  <div key={member._id} className="border-b border-gray-100 pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-800 font-semibold">{member.name}</span>
                      <div
                        className={`flex items-center gap-1 text-green-500 text-sm font-semibold`}
                      >
                        {member.hoursWorked} horas
                      </div>
                    </div>

                    <button className="text-[#6A8D73] text-center w-full bg-white p-2 rounded-md font-semibold text-sm">Ver detalles</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderSummary = () => {
    return (
      <div className="space-y-3 flex flex-col items-center justify-center">
        <div className="border-2 rounded-lg p-4 shadow-sm flex items-center justify-between gap-4 w-[80%] ">
          <div className="text-4xl font-bold text-gray-800">{dayData.activeProjects}</div>
          <div className="text-md text-right text-gray-600">Proyectos activos</div>
        </div>

        <div className="border-2 rounded-lg p-4 shadow-sm flex items-center justify-between gap-4 w-[80%] ">
          <div className="text-4xl font-bold text-gray-800">{dayData.totalCollaborators}</div>
          <div className="text-md text-right text-gray-600">Total de colaboradores</div>
        </div>

        <div className="border-2 rounded-lg p-4 shadow-sm flex items-center justify-between gap-4 w-[80%] ">
          <div className="text-4xl font-bold text-gray-800">{dayData.collaboratorsCompleted}</div>
          <div className="text-md text-right text-gray-600">completaron horario</div>
        </div>

        <div className="border-2 rounded-lg p-4 shadow-sm flex items-center justify-between gap-4 w-[80%] ">
          <div className="text-4xl font-bold text-gray-800">{
            dayData.totalCollaborators - dayData.collaboratorsCompleted  
          }</div>
          <div className="text-md text-right text-gray-600">pendientes</div>
        </div>
      </div>
    )
  }

  return (
    <UserPage>
      <div className="flex items-center justify-between p-2 mb-0 px-10 bg-[#EDEDED]">
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

      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="max-w-md mx-auto py-6 px-4">

          {/* Calendar Week */}
          {viewMode === "projects" && renderCalendarWeek()}

          {/* Toggle and Summary Button */}
          <div className="flex items-center justify-between mb-4">
            <button className="bg-[#525252] text-white px-6 py-2 rounded-md text-sm" onClick={toggleViewMode}>
              {viewMode === "projects" ? "Resúmen" : "Proyectos"}
            </button>
            {viewMode === "projects" && (
              <button className="text-gray-600">
                <FaExchangeAlt className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Content based on view mode */}
          {viewMode === "projects" ? renderProjects() : renderSummary()}
        </div>
      </div>
    </UserPage>
  )
}