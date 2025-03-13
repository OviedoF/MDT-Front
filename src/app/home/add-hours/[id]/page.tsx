import React from 'react'
import UserPage from '../../components/UserPage'

export default function page() {
    return (
        <UserPage>
            <div className="p-4 pb-24 ">
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

                {/* Date */}
                <div className="text-center mb-6">
                    <h2 className="text-gray-800 font-semibold my-2">Lunes 1 Febrero, 2025</h2>
                </div>

                {/* Time Entry Form */}
                <div className="space-y-6 flex flex-col items-end">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 flex flex-col items-center">
                            <label className="text-sm text-gray-600">Inicio</label>
                            <div className="relative bg-[#EDEDED]">
                                <input
                                    type="text"
                                    value="8:00 a.m."
                                    className="w-full bg-white rounded-lg p-3 pr-10 text-gray-800"
                                    readOnly
                                />
                                <svg
                                    className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>

                        <div className="space-y-2 flex flex-col items-center">
                            <label className="text-sm text-gray-600">Final</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value="7:20 p.m."
                                    className="w-full bg-white rounded-lg p-3 pr-10 text-gray-800"
                                    readOnly
                                />
                                <svg
                                    className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="space-y-2 w-full">
                        <label className="text-sm text-gray-600">Comentarios</label>
                        <textarea className="w-full h-32 bg-gray-100 rounded-lg p-3 text-gray-800 resize-none" readOnly />
                    </div>

                    {/* Edit Button */}
                    <button className="w-[40%] bg-[#6A8D73] hover:bg-[#5a7a62] text-white py-3 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                        </svg>
                        Editar
                    </button>
                </div>
            </div>
        </UserPage>
    )
}
