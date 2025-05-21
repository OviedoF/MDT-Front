"use client"

import { useState, useEffect } from "react"
import { useSnackbar } from "notistack"
import { format } from "date-fns"

// Components
import Header from "./components/work-calendar/Header"
import ProjectSelector from "./components/work-calendar/ProjectSelector"
import Calendar from "./components/work-calendar/Calendar"
import DayDetail from "./components/work-calendar/DayDetail"
import ReportConfirmationModal from "./components/work-calendar/ReportConfirmationModal"
import PdfPreviewModal from "./components/work-calendar/PdfPreviewModal"

const dayDetails: DayDetails = {
  date: "2025-04-28",
  totalHours: "08:00",
  extraHours: "01:30",
  sent: true,
  status: "sent",
  entries: [
    {
      _id: "entry1",
      name: "Desarrollo Frontend",
      comments: "Creación de componentes y lógica de estado",
      startTime: "08:00",
      endTime: "12:00",
      collaborators: [
        { _id: "u2", name: "Laura Gómez", email: "laura@example.com" },
        { _id: "u3", name: "Carlos Díaz" }
      ],
      user: { _id: "u1", name: "Juan Pérez", email: "juan@example.com" },
      supervisor: '',
      supervisorName: "",
      supervisorSignature: "",
      topographerSignature: "",
      incompleteUsers: [{ _id: "u3", name: "Carlos Díaz" }],
      activities: [
        {
          _id: "a1",
          name: "Diseño de componentes",
          description: "Botones, formularios y layout responsive",
          startTime: "08:00",
          endTime: "10:00",
          isOvertime: false
        },
        {
          _id: "a2",
          name: "Manejo de estado",
          description: "Implementación de contexto y reducers",
          startTime: "10:00",
          endTime: "12:00",
          isOvertime: false
        }
      ]
    },
    {
      _id: "entry2",
      name: "Revisión de PRs",
      comments: "Validación y pruebas de funcionalidades entregadas",
      startTime: "13:00",
      endTime: "17:30",
      collaborators: [],
      user: { _id: "u1", name: "Juan Pérez", email: "juan@example.com" },
      supervisor: '',
      supervisorName: "",
      supervisorSignature: "",
      topographerSignature: "",
      incompleteUsers: [],
      activities: [
        {
          _id: "a3",
          name: "Pruebas funcionales",
          description: "Pruebas manuales sobre nuevas funcionalidades",
          startTime: "13:00",
          endTime: "16:00",
          isOvertime: false
        },
        {
          _id: "a4",
          name: "Documentación de feedback",
          description: "Notas para mejorar calidad de código",
          startTime: "16:00",
          endTime: "17:30",
          isOvertime: true
        }
      ]
    }
  ]
};

// Types and utilities
import type { DayData, UserDayData, DayDetails } from "./types"
import { users } from "./components/work-calendar/data"
import { Project } from "./types"
import { makeQuery } from "@/app/utils/api"
import axios from "axios"
import env from "@/app/env"

export default function WorkCalendarPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [projects, setProjects] = useState<Project[]>([])
  // State
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [calendarData, setCalendarData] = useState<DayData[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [currentDayData, setCurrentDayData] = useState<DayDetails>(dayDetails)
  const [loadingDaySummary, setloadingDaySummary] = useState(false)
  const [loading, setLoading] = useState(false)

  // Modal states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false)

  useEffect(() => {
    getProjects()
  }, [currentDate])

  useEffect(() => {
    if (selectedProject) {
      getCalendarData()
    }
  }, [selectedProject, currentDate])


  const getProjects = () => {
    makeQuery(
      localStorage.getItem("token"),
      "getProjects",
      {},
      enqueueSnackbar,
      (response) => {
        setSelectedProject(response[0]._id)
        setProjects(response)
      },
      setLoading,
      () => { }
    )
  }

  const getCalendarData = () => {
    // * Month in YYYY-MM format
    const month = currentDate.toISOString().slice(0, 7)
    console.log("Month:", month)

    makeQuery(
      localStorage.getItem("token"),
      "getCalendarData",
      {
        project: selectedProject,
        month: month
      },
      enqueueSnackbar,
      (response) => {
        setCalendarData(response)
      },
      setLoading,
      () => { }
    )
  }

  // Calendar navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    setSelectedDate(null)
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    setSelectedDate(null)
  }

  const handleDateClick = (day: string) => {
    const [year, month, dayNum] = day.split("-").map(Number)
    const dayDate = new Date(year, month - 1, dayNum)

    makeQuery(
      localStorage.getItem("token"),
      'getDailySummary',
      { date: day, project: selectedProject },
      enqueueSnackbar,
      (response) => {
        setCurrentDayData(response)
        setSelectedDate(dayDate)
      },
      setloadingDaySummary
    )
  }

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId)
  }

  // Report handlers
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

    makeQuery(
      localStorage.getItem("token"),
      "postDailySummary",
      { date: format(selectedDate, "yyyy-MM-dd"), projectId: selectedProject },
      enqueueSnackbar,
      () => {
        getCalendarData()
        setIsReportModalOpen(false)
        setIsPdfPreviewOpen(false)
        enqueueSnackbar("Informe enviado correctamente", { variant: "success" })
      },
      setLoading,
      () => { }
    )
  }

  const handleDownload = async () => {
    const response = await axios.post(
      `${env.API_URL}/project/download-summary`,
      { date: format(selectedDate || '', "yyyy-MM-dd"), projectId: selectedProject },
      {
        responseType: 'blob',
      }
    );

    // Crear link de descarga
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  return (
    <main className="bg-violet-100 w-full min-h-screen">
      <Header title="Calendario de Trabajo" />

      <section className="p-4">
        <ProjectSelector projects={projects} selectedProject={selectedProject} onProjectChange={handleProjectChange} />

        <Calendar
          currentDate={currentDate}
          calendarData={calendarData}
          onDateClick={handleDateClick}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {selectedDate && currentDayData && (
          <DayDetail
            selectedDate={selectedDate}
            dayData={currentDayData}
            users={users}
            onShowPdfPreview={handleShowPdfPreview}
            onSendReport={handleSendReport}
            loading={loadingDaySummary}
          />
        )}
      </section>

      {/* Modals */}
      <ReportConfirmationModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onConfirm={confirmSendReport}
        selectedDate={selectedDate}
        selectedProject={selectedProject}
        projects={projects}
      />

      <PdfPreviewModal
        isOpen={isPdfPreviewOpen}
        onClose={() => setIsPdfPreviewOpen(false)}
        onSendReport={confirmSendReport}
        selectedDate={selectedDate}
        selectedProject={selectedProject}
        projects={projects}
        users={users}
        dayData={currentDayData}
        handleDownload={handleDownload}
      />
    </main>
  )
}
