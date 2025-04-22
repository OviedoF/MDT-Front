"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaSignOutAlt, FaCheck, FaTimes, FaInfoCircle } from "react-icons/fa"
import { makeQuery } from "@/app/utils/api"
import { useSnackbar } from "notistack"

interface User {
  _id: number
  name: string
  role: "topografo"
}

interface Project {
  _id: number
  name: string
  startTime: string
  endTime: string
}

interface OvertimeRequest {
  _id: number
  user: User
  entry: Project
  createdAt: Date
  startTime: string
  endTime: string
  reason: string
  status: "pending" | "approved" | "rejected"
}

function compararHoras(start1: string, end1: string, start2: string, end2: string) {
  // Convierte HH:MM a minutos totales
  const convertirAMinutos = (hora: any) => {
    const [h, m] = hora.split(":").map(Number)
    return h * 60 + m
  }

  const minutosGrupo1 = convertirAMinutos(end1) - convertirAMinutos(start1)
  const minutosGrupo2 = convertirAMinutos(end2) - convertirAMinutos(start2)
  const diferencia = minutosGrupo1 - minutosGrupo2

  const horas = Math.floor(Math.abs(diferencia) / 60)
  const minutos = Math.abs(diferencia) % 60

  const formato = `${horas}h${minutos ? ` ${minutos}m` : ""}`

  if (diferencia === 0) return "Mismo tiempo"
  return diferencia > 0 ? `${formato} más` : `${formato} menos`
}

function translateStatus(status: string) {
  switch (status) {
    case "pending":
      return "Pendiente"
    case "approved":
      return "Aprobado"
    case "rejected":
      return "Rechazado"
    default:
      return status
  }
}

export default function ApproveOvertimePage() {
  const router = useRouter()
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<OvertimeRequest | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  // Añadir nuevos estados para el modal de confirmación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null)
  const [confirmMessage, setConfirmMessage] = useState("")
  const [requestToAction, setRequestToAction] = useState<number | null>(null)

  const getOvertimeRequests = async () => {
    const token = localStorage.getItem("token")
    makeQuery(token, "getExtraHourRequests", {}, enqueueSnackbar, (data) => {
      setOvertimeRequests(data)
    })
  }

  useEffect(() => {
    getOvertimeRequests()
  }, [])

  // Modificar las funciones handleApprove y handleReject para mostrar el modal
  const handleApprove = (_id: number) => {
    setRequestToAction(_id)
    setConfirmAction("approve")
    setConfirmMessage("")
    setIsConfirmModalOpen(true)
  }

  const handleReject = (_id: number) => {
    setRequestToAction(_id)
    setConfirmAction("reject")
    setConfirmMessage("")
    setIsConfirmModalOpen(true)
  }

  // Añadir una nueva función para ejecutar la acción con el mensaje
  const handleConfirmAction = () => {
    if (!requestToAction) return

    if (confirmAction === "approve") {
      makeQuery(
        localStorage.getItem("token"),
        "approveExtraHourRequest",
        { _id: requestToAction, message: confirmMessage },
        enqueueSnackbar,
        () => {
          getOvertimeRequests()
          setSelectedRequest(null)
          setIsConfirmModalOpen(false)
        },
      )
    } else if (confirmAction === "reject") {
      makeQuery(
        localStorage.getItem("token"),
        "updateExtraHourRequest",
        { _id: requestToAction, status: "rejected", message: confirmMessage },
        enqueueSnackbar,
        () => {
          getOvertimeRequests()
          setSelectedRequest(null)
          setIsConfirmModalOpen(false)
        },
      )
    }
  }

  return (
    <main className="bg-violet-100 w-full min-h-screen">
      <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Aprobar Horas Extra</h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center bg-violet-700 hover:bg-violet-800 px-4 py-2 rounded-md transition duration-300"
        >
          <FaSignOutAlt className="mr-2" />
          Dashboard
        </button>
      </header>

      <section className="p-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Solicitudes de Horas Extra</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Topógrafo
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actividad
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Horas
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {overtimeRequests.map((request) => (
                  <tr key={request._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{request.user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.entry.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(request.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{`${compararHoras(request.startTime, request.endTime, request.entry.startTime, request.entry.endTime)}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.status === "approved"
                            ? "bg-[#E8F5E6] text-green-800"
                            : request.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {translateStatus(request.status)}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(request._id)}
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleReject(request._id)}
                            className="text-red-600 hover:text-red-900 mr-2"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                      <button onClick={() => setSelectedRequest(request)} className="text-blue-600 hover:text-blue-900">
                        <FaInfoCircle />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Detalles de la Solicitud</h3>
            <p>
              <strong>Topógrafo:</strong> {selectedRequest.user.name}
            </p>
            <p>
              <strong>Proyecto:</strong> {selectedRequest.entry.name}
            </p>
            <p>
              <strong>Fecha:</strong> {new Date(selectedRequest.createdAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Horas:</strong>{" "}
              {`${compararHoras(selectedRequest.startTime, selectedRequest.endTime, selectedRequest.entry.startTime, selectedRequest.entry.endTime)}`}
            </p>
            <p>
              <strong>Razón:</strong> {selectedRequest.reason}
            </p>
            <p>
              <strong>Estado:</strong> {translateStatus(selectedRequest.status)}
            </p>
            <div className="mt-4 flex justify-end">
              {selectedRequest.status === "pending" && (
                <>
                  <button
                    onClick={() => handleApprove(selectedRequest._id)}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleReject(selectedRequest._id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
                  >
                    Rechazar
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedRequest(null)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">
              {confirmAction === "approve" ? "Aprobar" : "Rechazar"} Solicitud de Horas Extra
            </h3>
            <p className="mb-4">
              Por favor, proporcione un motivo para {confirmAction === "approve" ? "aprobar" : "rechazar"} esta
              solicitud:
            </p>
            <textarea
              value={confirmMessage}
              onChange={(e) => setConfirmMessage(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              rows={4}
              placeholder={`Motivo de ${confirmAction === "approve" ? "aprobación" : "rechazo"}...`}
            />
            <div className="flex justify-end">
              <button
                onClick={handleConfirmAction}
                className={`${
                  confirmAction === "approve" ? "bg-green-500 hover:bg-green-700" : "bg-red-500 hover:bg-red-700"
                } text-white font-bold py-2 px-4 rounded mr-2`}
              >
                Confirmar
              </button>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
