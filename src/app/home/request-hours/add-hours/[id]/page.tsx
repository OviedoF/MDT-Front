import UserPage from "@/app/home/components/UserPage"
import Link from "next/link"
import { FaArrowLeft, FaClock, FaPencilAlt } from "react-icons/fa"

export default function AddHoursPage() {
  return (
    <UserPage>
      <div className="p-4 pb-24">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/home/request-hours" className="text-gray-600">
            <FaArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-medium text-gray-800">Agregar horas</h1>
        </div>

        {/* Project Info Card */}
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
        </div>

        {/* Date */}
        <div className="text-center mb-6">
          <h3 className="text-gray-800 font-semibold">Lunes 1 Febrero, 2025</h3>
        </div>

        {/* Total Hours */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total de Horas</span>
            <span className="text-green font-medium">56 horas 17 minutos</span>
          </div>
        </div>

        {/* Time Inputs */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2 flex flex-col items-center">
            <label className="text-sm text-gray-600">Inicio</label>
            <div className="relative">
              <input type="text" value="8:00 a.m." className="w-full bg-gray-100 rounded-lg p-3 pr-10" readOnly />
              <FaClock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2 flex flex-col items-center">
            <label className="text-sm text-gray-600">Final</label>
            <div className="relative">
              <input type="text" value="7:20 p.m." className="w-full bg-gray-100 rounded-lg p-3 pr-10" readOnly />
              <FaClock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button className="w-full flex items-center justify-center gap-2 bg-[#525252] hover:bg-gray-800 text-white rounded-lg py-3 px-4 transition-colors">
            <FaPencilAlt className="w-4 h-4" />
            Agregar Horas
          </button>

          <button className="w-full bg-green font-bold hover:bg-[#5a7a62] text-white text-xl rounded-lg py-3 px-4 transition-colors">
            Enviar
          </button>
        </div>
      </div>
    </UserPage>
  )
}

