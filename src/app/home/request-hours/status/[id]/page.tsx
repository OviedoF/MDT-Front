import UserPage from "@/app/home/components/UserPage"
import Link from "next/link"
import { FaArrowLeft } from "react-icons/fa"

type Status = "approved" | "rejected" | "in-process"

interface ProjectStatus {
  id: string
  code: string
  name: string
  description: string
  status: Status
}

const projects: ProjectStatus[] = [
  {
    id: "1",
    code: "00000129",
    name: "Centro de San Salvador",
    description: "Inspección del terreno",
    status: "approved",
  },
  {
    id: "2",
    code: "00000129",
    name: "Centro de San Salvador",
    description: "Inspección del terreno",
    status: "rejected",
  },
  {
    id: "3",
    code: "00000129",
    name: "Centro de San Salvador",
    description: "Inspección del terreno",
    status: "in-process",
  },
]

const getStatusBadge = (status: Status) => {
  switch (status) {
    case "approved":
      return <span className="text-[#55C157] bg-[#E8F5E6] border-2 border-[#55C157] px-5 py-2 rounded-2xl text-sm">Aprobado</span>
    case "rejected":
      return <span className="text-[#FF4220] bg-red-100 px-5 py-2 border-2 border-[#FF4220] rounded-2xl text-sm">No aprobado</span>
    case "in-process":
      return <span className="text-[#16A4F8] bg-blue-100 px-5 py-2 border-2 border-[#16A4F8] rounded-2xl text-sm">En proceso</span>
  }
}

export default function StatusPage() {
  return (
    <UserPage>
      <div className="p-4 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/home/request-hours" className="text-gray-600">
            <FaArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-medium text-gray-800">Estado</h1>
        </div>

        {/* Project Status Cards */}
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-[#EDEDED] rounded-lg p-5 shadow-sm flex flex-col ">
              <div className="flex items-center justify-between mb-4">
                {getStatusBadge(project.status)}
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm">Responsable</span>
                  <span className="bg-[#6A8D73] text-white text-xs px-2 py-2 rounded-full">PR</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-[#55C157]" />
                <span className="text-gray-600 ml-4">{project.code}</span>
              </div>

              <div className="mb-3">
                <h2 className="font-bold text-gray-800">{project.name}</h2>
                <p className="text-gray-600">{project.description}</p>
              </div>

              <Link href={'/home/request-hours/status/request/1'} className="w-full text-base font-bold text-center py-2 bg-white text-[#6A8D73] hover:text-[#5a7a62] transition-colors rounded-xl">
                Ver detalles
              </Link>
            </div>
          ))}
        </div>
      </div>
    </UserPage>
  )
}

