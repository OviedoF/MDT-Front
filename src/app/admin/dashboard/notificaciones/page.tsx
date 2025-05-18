"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSnackbar } from "notistack"
import { FaSignOutAlt, FaBell, FaUser, FaProjectDiagram, FaPaperPlane, FaTrash, FaEye, FaCheck } from "react-icons/fa"
import { makeQuery } from "@/app/utils/api"

interface User {
  _id: string
  name: string
  role: "supervisor" | "colaborador" | "topografo" | "admin"
}

interface Project {
  _id: string
  name: string
  alias: string
}

interface Notification {
  _id: string
  user: User
  project: Project
  title: string
  message: string
  createdAt: Date
}

export default function NotificationsPage() {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState<"create" | "list">("create")

  const handleCreateNotification = () => {
    // Validar campos
    if (selectedUser === '') {
      enqueueSnackbar("Por favor, selecciona un usuario", { variant: "warning" })
      return
    }

    if (selectedProject === '') {
      enqueueSnackbar("Por favor, selecciona un proyecto", { variant: "warning" })
      return
    }

    if (!title.trim()) {
      enqueueSnackbar("Por favor, ingresa un título", { variant: "warning" })
      return
    }

    if (!message.trim()) {
      enqueueSnackbar("Por favor, ingresa un mensaje", { variant: "warning" })
      return
    }

    // Crear nueva notificación
    const newNotification = {
      user: selectedUser,
      project: selectedProject,
      title,
      message,
    }

    makeQuery(
      localStorage.getItem("token"),
      "createNotification",
      newNotification,
      enqueueSnackbar,
      (data) => {
        getNotifications()
        enqueueSnackbar("Notificación enviada con éxito", { variant: "success" })
        resetForm()
      },
    )
  }

  const resetForm = () => {
    setSelectedUser('')
    setSelectedProject(null)
    setTitle("")
    setMessage("")
  }

  const handleDeleteNotification = (_id: string) => {
    makeQuery(
      localStorage.getItem("token"),
      "deleteNotification",
      _id,
      enqueueSnackbar,
      () => {
        getNotifications()
        enqueueSnackbar("Notificación eliminada con éxito", { variant: "success" })
      },
    )
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).replace(",", "")
  }

  const getNotifications = () => {
    const token = localStorage.getItem("token")
    makeQuery(
      token,
      "getNotifications",
      "",
      enqueueSnackbar,
      (data) => setNotifications(data),
    )
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    makeQuery(
      token,
      "getUsers",
      "",
      enqueueSnackbar,
      (data) => setUsers(data.filter((user: User) => user.role !== "admin")),
    );

    makeQuery(
      token,
      "getProjects",
      "",
      enqueueSnackbar,
      (data) => setProjects(data),
    );
  }, []);

  useEffect(() => {
    getNotifications()
  }, [])

  return (
    <main className="bg-violet-100 w-full min-h-screen">
      <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center">
          <FaBell className="mr-2" />
          Gestión de Notificaciones
        </h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center bg-violet-700 hover:bg-violet-800 px-4 py-2 rounded-md transition duration-300"
        >
          <FaSignOutAlt className="mr-2" />
          Dashboard
        </button>
      </header>

      <section className="p-4">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-4">
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === "create"
                  ? "text-violet-600 border-b-2 border-violet-600"
                  : "text-gray-500 hover:text-violet-500"
                }`}
              onClick={() => setActiveTab("create")}
            >
              Crear Notificación
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === "list"
                  ? "text-violet-600 border-b-2 border-violet-600"
                  : "text-gray-500 hover:text-violet-500"
                }`}
              onClick={() => setActiveTab("list")}
            >
              Notificaciones Enviadas
            </button>
          </div>
        </div>

        {activeTab === "create" ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Crear Nueva Notificación</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario Destinatario *
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    id="user"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="pl-10 w-full p-2 border rounded focus:ring-violet-500 focus:border-violet-500"
                  >
                    <option value={0}>Selecciona un usuario</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
                  Proyecto Relacionado
                </label>
                <div className="relative">
                  <FaProjectDiagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    id="project"
                    value={selectedProject || ""}
                    onChange={(e) => setSelectedProject(e.target.value ? e.target.value : null)}
                    className="pl-10 w-full p-2 border rounded focus:ring-violet-500 focus:border-violet-500"
                  >
                    <option value="">Sin proyecto específico</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.alias}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título de la Notificación *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Actualización importante del proyecto"
                  className="w-full p-2 border rounded focus:ring-violet-500 focus:border-violet-500"
                  maxLength={100}
                />
                <div className="text-xs text-right text-gray-500 mt-1">{title.length}/100 caracteres</div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje *
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe aquí el contenido detallado de la notificación..."
                  className="w-full p-2 border rounded focus:ring-violet-500 focus:border-violet-500"
                  rows={5}
                  maxLength={500}
                />
                <div className="text-xs text-right text-gray-500 mt-1">{message.length}/500 caracteres</div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded flex items-center"
                  disabled={!title || !message || selectedUser === ''}
                >
                  <FaEye className="mr-2" />
                  Vista Previa
                </button>
                <button
                  onClick={handleCreateNotification}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded flex items-center"
                >
                  <FaPaperPlane className="mr-2" />
                  Enviar Notificación
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Notificaciones Enviadas</h2>

            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No hay notificaciones enviadas</div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => {

                  return (
                    <div
                      key={notification._id}
                      className={`border rounded-lg p-4`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{notification.title}</h3>
                          <p className="text-sm text-gray-500">
                            Para: {notification.user?.name} • {formatDate(notification.createdAt)}
                          </p>
                          {notification.project && <p className="text-sm text-violet-600 mt-1">Proyecto: {notification.project?.name}</p>}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDeleteNotification(notification._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Eliminar notificación"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-gray-700 whitespace-pre-line">{notification.message}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Modal de Vista Previa */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Vista Previa de Notificación</h3>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-bold text-lg">{title || "(Sin título)"}</h4>
              <p className="text-sm text-gray-500 mb-2">
                Para: {users.find((u) => u._id === selectedUser)?.name || "Usuario no seleccionado"}
                {selectedProject && ` • Proyecto: ${projects.find((p) => p._id === selectedProject)?.name}`}
              </p>
              <p className="whitespace-pre-line">{message || "(Sin mensaje)"}</p>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsPreviewOpen(false)}
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
