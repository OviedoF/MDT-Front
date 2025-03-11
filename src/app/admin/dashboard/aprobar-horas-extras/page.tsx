"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaSignOutAlt, FaCheck, FaTimes, FaInfoCircle } from "react-icons/fa"

interface User {
  id: number
  name: string
  role: "topografo"
}

interface OvertimeRequest {
  id: number
  userId: number
  projectId: number
  date: Date
  hours: number
  reason: string
  status: "pending" | "approved" | "rejected"
}

interface Project {
  id: number
  name: string
}

const users: User[] = [
  { id: 1, name: "Juan Pérez", role: "topografo" },
  { id: 2, name: "María García", role: "topografo" },
]

const projects: Project[] = [
  { id: 1, name: "Proyecto A" },
  { id: 2, name: "Proyecto B" },
]

// Función para generar datos de ejemplo
const generateOvertimeRequests = (): OvertimeRequest[] => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    userId: users[Math.floor(Math.random() * users.length)].id,
    projectId: projects[Math.floor(Math.random() * projects.length)].id,
    date: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
    hours: Math.floor(Math.random() * 4) + 1,
    reason: "Trabajo adicional requerido para completar la tarea",
    status: "pending",
  }))
}

export default function ApproveOvertimePage() {
  const router = useRouter()
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<OvertimeRequest | null>(null)

  useEffect(() => {
    // En una aplicación real, esto sería una llamada a la API
    setOvertimeRequests(generateOvertimeRequests())
  }, [])

  const handleApprove = (id: number) => {
    setOvertimeRequests((requests) =>
      requests.map((request) => (request.id === id ? { ...request, status: "approved" } : request)),
    )
    setSelectedRequest(null)
  }

  const handleReject = (id: number) => {
    setOvertimeRequests((requests) =>
      requests.map((request) => (request.id === id ? { ...request, status: "rejected" } : request)),
    )
    setSelectedRequest(null)
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
                    Proyecto
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
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{users.find((u) => u.id === request.userId)?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {projects.find((p) => p.id === request.projectId)?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.date.toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.hours}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : request.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
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
              <strong>Topógrafo:</strong> {users.find((u) => u.id === selectedRequest.userId)?.name}
            </p>
            <p>
              <strong>Proyecto:</strong> {projects.find((p) => p.id === selectedRequest.projectId)?.name}
            </p>
            <p>
              <strong>Fecha:</strong> {selectedRequest.date.toLocaleDateString()}
            </p>
            <p>
              <strong>Horas:</strong> {selectedRequest.hours}
            </p>
            <p>
              <strong>Razón:</strong> {selectedRequest.reason}
            </p>
            <p>
              <strong>Estado:</strong> {selectedRequest.status}
            </p>
            <div className="mt-4 flex justify-end">
              {selectedRequest.status === "pending" && (
                <>
                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleReject(selectedRequest.id)}
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
    </main>
  )
}

