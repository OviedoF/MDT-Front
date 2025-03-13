import UserPage from "../components/UserPage"
import Link from "next/link"
import { FaClock, FaArrowLeft } from "react-icons/fa"

export default function RequestHoursPage() {
  const projects = [
    {
      id: "1",
      code: "00000129",
      name: "Centro de San Salvador",
      description: "Inspección del terreno",
      status: "active",
    },
    {
      id: "2",
      code: "00000129",
      name: "Centro de San Salvador",
      description: "Inspección del terreno",
      status: "active",
    },
  ]

  return (
    <UserPage>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/home/user" className="text-gray-600">
            <FaArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-medium text-gray-800">Solicitar horas</h1>
        </div>

        {/* Project Cards */}
        <div className="space-y-4">
          {projects.map((project) => (
            <>
              <div className="bg-[#EDEDED] rounded-2xl p-4 shadow-sm mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-[#55C157]" />
                  <span className="text-gray-600 ml-4">00000129</span>
                  <div className="flex-1" />
                  <span className="text-gray-600 text-sm">Responsable</span>
                  <span className="bg-[#6A8D73] text-white text-xs px-2 py-2 rounded-full">PR</span>
                </div>
                <h1 className="font-bold text-gray-800">Centro de San Salvador</h1>
                <p className="text-gray-600">Inspección del terreno</p>

                <div className="space-y-2">
                  <Link href={'/home/request-hours/add-hours/1'} className="w-full flex bg-white text-green my-2 font-semibold items-center justify-center gap-2 border border-gray-200 rounded-lg py-2 px-4 hover:bg-gray-50 transition-colors">
                    <FaClock className="w-4 h-4" />
                    <span>Agregar horas</span>
                  </Link>

                  <Link href={'/home/request-hours/status/1'} className="w-full flex bg-white text-green my-2 font-semibold items-center justify-center gap-2 border border-gray-200 rounded-lg py-2 px-4 hover:bg-gray-50 transition-colors" >
                    Ver Estado
                  </Link>
                </div>
              </div>
            </>
          ))}
        </div>
      </div>
    </UserPage>
  )
}

