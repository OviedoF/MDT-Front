import React from 'react'
import UserPage from '../components/UserPage'
import Link from 'next/link'

interface Project {
    id: string
    code: string
    name: string
    description: string
    incompleteDays: number
    status: "active" | "inactive"
}

const projects: Project[] = [
    {
        id: "1",
        code: "00000129",
        name: "Proyecto Centro de San Salvador",
        description: "Inspección del terreno",
        incompleteDays: 0,
        status: "active",
    },
    {
        id: "2",
        code: "00000129",
        name: "Proyecto El Espino",
        description: "Inspección del terreno",
        incompleteDays: 0,
        status: "active",
    },
    {
        id: "3",
        code: "00000129",
        name: "Proyecto Nuevo Cuscatlán",
        description: "Inspección del terreno",
        incompleteDays: 0,
        status: "active",
    },
]

export default function page() {
    return (
        <UserPage>
            <main className="p-4 pb-24">
                <div className="max-w-md mx-auto">
                    <h1 className="text-xl font-bold text-gray-800 my-2">Historial</h1>

                    <div className="space-y-4">
                        {projects.map((project) => (
                            <div key={project.id} className="bg-white rounded-lg py-4 shadow-sm flex flex-col">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-[#A5A5A5]" />
                                    <span className="text-gray-600 text-sm ml-4">{project.code}</span>
                                    <div className="flex-1" />
                                    <div className="text-sm text-gray-600 mr-5">Días Incompletos ({project.incompleteDays})</div>
                                    <span className="bg-green text-white text-xs px-2 py-2 rounded-full">PR</span>
                                </div>

                                <div className="mb-3">
                                    <span className="font-bold text-gray-800">{project.name}</span>
                                    {" - "}
                                    <span className="font-normal text-gray-500">{project.description}</span>
                                </div>

                                <Link href={'/home/add-hours'} className="w-full bg-green text-center hover:bg-[#5a7a62] text-white py-2 px-4 rounded-xl transition-colors text-base font-medium">
                                    Agregar horas
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </UserPage>
    )
}
