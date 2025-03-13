import React from "react"
import UserPage from "../components/UserPage"
import Link from "next/link"
import { BsEye } from "react-icons/bs"

export default function Page() {
  return (
    <UserPage>
      <div className="p-4 pb-24">
        {/* Project Header */}
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

        {/* Month Selector */}
        <div className="flex items-center justify-center my-4">
          <button className="p-1 border-green border-2 rounded-full">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="text-gray-800 font-medium mx-4">Febrero, 2025</span>

          <button className="p-1 border-green border-2 rounded-full">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Total Hours */}
        <div className="bg-gray-100 rounded-lg p-4 px-6 mb-4 flex justify-between items-center">
          <div className="text-gray-600 text-sm">Total de Horas</div>
          <div className="text-[#698167] font-bold">56 horas 17 minutos</div>
        </div>

        {/* Daily Entries */}
        <div className="space-y-4">
          {[
            { date: "Lunes, 1 Feb", hours: "6 h 39 m" },
            { date: "Martes, 2 Feb", hours: "4 h 20 m" },
            { date: "Miércoles, 3 Feb", hours: "8 h 11 m" },
            { date: "Sábado, 6 Feb", hours: "-" },
          ].map((day, index) => (
            <div className="flex flex-col">
              <div className="flex justify-between items-center">
                <p className="font-semibold">{day.date}</p>

                <span className="bg-[#F5F5F5] font-semibold py-3 px-8 rounded-sxl">
                  {day.hours}
                </span>
              </div>

              <Link href={'/home/add-hours/1'} className="border-green border-2 py-2 w-full text-green font-semibold flex items-center justify-center gap-2 rounded-xl mt-4">
                <BsEye className="text-green" />
                Ver detalle
              </Link>
            </div>
          ))}
        </div>
      </div>
    </UserPage>
  )
}