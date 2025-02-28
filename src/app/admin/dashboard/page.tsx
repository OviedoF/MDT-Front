"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FaUsers, FaProjectDiagram, FaUserPlus, FaSignOutAlt, FaCalendar, FaDollarSign } from "react-icons/fa"

type DashboardOption = "users" | "projects" | "addCollaborator" | "calendar" | "freeCollaborators"

const pages = [
  { name: "Usuarios", path: "/admin/dashboard/users", icon: <FaUsers className="text-4xl mb-2" /> },
  { name: "Proyectos", path: "/admin/dashboard/proyectos", icon: <FaProjectDiagram className="text-4xl mb-2" /> },
  { name: "Agregar colaborador", path: "/admin/dashboard/agregar-colaborador", icon: <FaUserPlus className="text-4xl mb-2" /> },
  { name: "Calendario", path: "/admin/dashboard/calendario", icon: <FaCalendar className="text-4xl mb-2" /> },
  { name: "Colaboradores libres", path: "/admin/dashboard/colaboradores-libres", icon: <FaUserPlus className="text-4xl mb-2" /> },
  { name: "Rotación de personal", path: "/admin/dashboard/rotacion-personal", icon: <FaProjectDiagram className="text-4xl mb-2" /> },
  { name: "Reporte de salarios", path: "/admin/dashboard/reporte-salarios", icon: <FaDollarSign className="text-4xl mb-2" /> },
  { name: "Costo de proyectos", path: "/admin/dashboard/costo-proyectos", icon: <FaDollarSign className="text-4xl mb-2" /> },
]

export default function DashboardPage() {
  const [selectedOption, setSelectedOption] = useState<DashboardOption | null>(null)
  const router = useRouter()
  const navigate = useRouter().push;

  const handleLogout = () => {
    // Aquí iría la lógica para cerrar sesión
    router.push("/admin/login")
  }

  return (
    <main className="min-h-screen bg-violet-100">
      <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center bg-violet-700 hover:bg-violet-800 px-4 py-2 rounded-md transition duration-300"
        >
          <FaSignOutAlt className="mr-2" />
          Cerrar Sesión
        </button>
      </header>
      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {pages.map((page) => (
            <DashboardCard
              key={page.name}
              icon={page.icon}
              title={page.name}
              onClick={() => navigate(page.path)}
              isSelected={page.name === selectedOption}
            />
          ))}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center text-gray-500">Selecciona una opción para comenzar</div>
        </div>
      </main>
    </main>
  )
}

interface DashboardCardProps {
  icon: React.ReactNode
  title: string
  onClick: () => void
  isSelected: boolean
}

function DashboardCard({ icon, title, onClick, isSelected }: DashboardCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-6 rounded-lg shadow-md transition duration-300 bg-white text-violet-600 hover:bg-violet-600 hover:text-white`}
    >
      {icon}
      <h2 className="text-lg font-semibold">{title}</h2>
    </button>
  )
}

