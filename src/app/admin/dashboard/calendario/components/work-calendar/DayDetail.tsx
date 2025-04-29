"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { FaClock, FaUser, FaComments, FaFilePdf, FaPaperPlane, FaTimes } from "react-icons/fa"
import type { User, DayDetails } from "../../types"

interface DayDetailProps {
  selectedDate: Date
  dayData: DayDetails
  users: User[]
  onShowPdfPreview: () => void
  onSendReport: () => void
  loading: boolean
}

export default function DayDetail({
  selectedDate,
  dayData,
  onShowPdfPreview,
  onSendReport,
  loading,
}: DayDetailProps) {
  const { totalHours, extraHours } = dayData
  console.log("dayData", dayData)

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Detalle del {format(selectedDate, "d 'de' MMMM", { locale: es })}</h3>
        <div className="flex space-x-2">
          <button
            onClick={onShowPdfPreview}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <FaFilePdf className="mr-2" />
            Ver PDF
          </button>
          <button
            onClick={onSendReport}
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
          <p className="text-2xl font-bold">{
            (parseFloat(totalHours) - parseFloat(extraHours)).toFixed(1)}
          </p>
        </div>
        <div className="bg-orange-100 p-3 rounded-lg">
          <h4 className="font-semibold flex items-center">
            <FaClock className="mr-2" />
            Horas Extra
          </h4>
          <p className="text-2xl font-bold">{
            parseFloat(extraHours).toFixed(1)
          }</p>
        </div>
      </div>

      <h4 className="font-semibold mb-2 flex items-center">
        <FaUser className="mr-2" />
        Actividades del Equipo
      </h4>

      {dayData.entries.map((activity, i) => {
        return (
          <div key={i} className="border p-3 rounded-lg mb-3">

            <div className="flex justify-between">
              <span className="font-medium">
                {activity.name}
              </span>
              <div className="text-sm">
                <span className="mr-2">
                  {activity.startTime} - {activity.endTime}
                </span>
              </div>
            </div>

            {activity.incompleteUsers.length > 0 && (
              <div className="mb-4">
                <div className="bg-red-50 p-3 rounded-lg">
                  <h4 className="font-semibold mb-2 text-red-600 flex items-center">
                    <FaTimes className="mr-2" />
                    Usuarios con Información Incompleta
                  </h4>

                  {activity.incompleteUsers.map((user) => {
                    return (
                      <div key={user._id} className="flex justify-between items-center py-2 border-b last:border-0">
                        <span>
                          {user?.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mt-2 pl-4 border-l-2 border-gray-200">
              <p className="font-medium">Supervisor: {activity.supervisor.name} | Topógrafo: {activity.user.name}</p>
              <p className="text-sm text-gray-600 mt-1">Colaboradores: {
                activity.collaborators.map((collab, index) => (
                  <span key={index}>
                    {collab.name}
                    {index < activity.collaborators.length - 1 ? ", " : ""}
                  </span>
                ))
              }</p>
            </div>

            {activity.activities.map((act, index) => (
              <div key={index} className="mt-2 pl-4 border-l-2 border-gray-200">
                <p className="font-medium">{act.name} {`
                    (${act.startTime} - ${act.endTime}) ${act.isOvertime ? "(Horas Extra)" : ""}
                  `}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {act.description}
                </p>
              </div>
            ))}

            {activity.comments && (
              <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <div className="flex items-start">
                  <FaComments className="mr-2 mt-1" />
                  <span>{activity.comments}</span>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
