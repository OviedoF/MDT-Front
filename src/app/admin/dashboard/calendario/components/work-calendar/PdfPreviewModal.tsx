"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { DayDetails, Project, User } from "../../types"
import Modal from "./Modal"

interface PdfPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSendReport: () => void
  selectedDate: Date | null
  selectedProject: string
  projects: Project[]
  users: User[]
  dayData: DayDetails | undefined
}

export default function PdfPreviewModal({
  isOpen,
  onClose,
  onSendReport,
  selectedDate,
  selectedProject,
  projects,
  dayData,
}: PdfPreviewModalProps) {
  if (!selectedDate || !dayData) return null
  console.log("dayData", dayData)

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Vista Previa del Informe PDF</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="bg-gray-100 p-6 rounded-lg border border-gray-300 max-h-[70vh] overflow-y-auto">
          {/* Simulación de PDF */}
          <div className="bg-white p-8 shadow-md">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Informe de Actividades</h2>
              <h3 className="text-xl">{projects.find((p) => p._id === selectedProject)?.name}</h3>
              <p className="text-gray-600">{format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })}</p>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold border-b pb-2 mb-3">Resumen de Horas</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Horas Normales:</p>
                  <p className="text-xl">{
                    (parseFloat(dayData.totalHours) - parseFloat(dayData.extraHours)).toFixed(1 )
                  } horas</p>
                </div>
                <div>
                  <p className="font-medium">Horas Extra:</p>
                  <p className="text-xl">{dayData.extraHours} horas</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold border-b pb-2 mb-3">Actividades</h4>

              {dayData.entries.map((entry) => (
                <div className="mb-6 pb-4 border-b last:border-0" key={entry._id}>
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-bold">{entry.name}</h5>
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

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium">Topógrafo:</p>
                      <p>{entry.user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email del topógrafo:</p>
                      <p>{entry.user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium">Colaboradores:</p>
                      <ul className="list-disc pl-5">
                        {entry.collaborators.map((collaborator, index) => (
                          <li key={collaborator._id} className="mb-1 mr-2">
                            {collaborator.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium mb-1">Actividades Realizadas:</p>
                    <ul className="list-disc pl-5">
                      {entry.activities.map((activity) => (
                        <li key={activity._id} className="mb-1">
                          {activity.name} - {`(${activity.startTime} a ${activity.endTime})`}
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
              ))}
            </div>

            {/* logo */}
            <div className="flex justify-center mb-6">
              <img src="/logo.jpg" alt="Logo" className="w-32 h-auto" />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onSendReport}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <span className="mr-2">📧</span> Enviar por Email
          </button>
        </div>
      </div>
    </Modal>
  )
}
