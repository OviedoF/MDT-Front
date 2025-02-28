"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FaSignOutAlt, FaEnvelope, FaProjectDiagram, FaPaperPlane } from "react-icons/fa"
import { useSnackbar } from "notistack"

interface Project {
  id: number
  name: string
}

const projects: Project[] = [
  { id: 1, name: "Proyecto A" },
  { id: 2, name: "Proyecto B" },
  { id: 3, name: "Proyecto C" },
  { id: 4, name: "Proyecto D" },
]

export default function SendProjectEmailPage() {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [email, setEmail] = useState("")
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || selectedProjectId === "") {
      enqueueSnackbar("Por favor, complete todos los campos", { variant: "warning" })
      return
    }

    setIsLoading(true)

    try {
      // Aquí iría la llamada real a tu API
      const response = await fetch("/api/send-project-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, projectId: selectedProjectId }),
      })

      if (response.ok) {
        enqueueSnackbar("Email enviado exitosamente", { variant: "success" })
        setEmail("")
        setSelectedProjectId("")
      } else {
        throw new Error("Error al enviar el email")
      }
    } catch (error) {
      console.error("Error:", error)
      enqueueSnackbar("Error al enviar el email", { variant: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="bg-violet-100 w-full min-h-screen">
      <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Enviar Email de Proyecto</h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center bg-violet-700 hover:bg-violet-800 px-4 py-2 rounded-md transition duration-300"
        >
          <FaSignOutAlt className="mr-2" />
          Dashboard
        </button>
      </header>

      <section className="p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">Enviar Información del Proyecto</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full p-2 border rounded focus:ring-violet-500 focus:border-violet-500"
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
                Proyecto
              </label>
              <div className="relative">
                <FaProjectDiagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  id="project"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                  className="pl-10 w-full p-2 border rounded focus:ring-violet-500 focus:border-violet-500"
                  required
                >
                  <option value="">Seleccione un proyecto</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className={`w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <FaPaperPlane className="mr-2" />
              )}
              {isLoading ? "Enviando..." : "Enviar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}