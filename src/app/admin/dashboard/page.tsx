"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FaUsers, FaProjectDiagram, FaUserPlus, FaSignOutAlt, FaCalendar } from "react-icons/fa"

type DashboardOption = "users" | "projects" | "addCollaborator" | "calendar"

export default function DashboardPage() {
  const [selectedOption, setSelectedOption] = useState<DashboardOption | null>(null)
  const router = useRouter()

  const handleLogout = () => {
    // Aquí iría la lógica para cerrar sesión
    router.push("/admin/login")
  }

  const renderContent = () => {
    switch (selectedOption) {
      case "users":
        return <div className="text-center">Contenido para manejar usuarios</div>
      case "projects":
        return <div className="text-center">Contenido para manejar proyectos</div>
      case "addCollaborator":
        return <div className="text-center">Contenido para añadir colaborador a proyecto</div>
      default:
        return <div className="text-center text-gray-500">Selecciona una opción para comenzar</div>
    }
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
          <DashboardCard
            icon={<FaUsers className="text-4xl mb-2" />}
            title="Manejar Usuarios"
            onClick={() => router.push("/admin/dashboard/users")}
            isSelected={selectedOption === "users"}
          />
          <DashboardCard
            icon={<FaProjectDiagram className="text-4xl mb-2" />}
            title="Manejar Proyectos"
            onClick={() => router.push("/admin/dashboard/proyectos")}
            isSelected={selectedOption === "projects"}
          />
          <DashboardCard
            icon={<FaUserPlus className="text-4xl mb-2" />}
            title="Añadir Colaborador"
            onClick={() => router.push("/admin/dashboard/agregar-colaborador")}
            isSelected={selectedOption === "addCollaborator"}
          />
          <DashboardCard
            icon={<FaCalendar className="text-4xl mb-2" />}
            title="Calendario de proyecto"
            onClick={() => router.push("/admin/dashboard/calendario")}
            isSelected={selectedOption === "calendar"}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">{renderContent()}</div>
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

