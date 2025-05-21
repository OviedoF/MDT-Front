'use client'
import React, { useEffect, useState } from 'react'
import UserPage from './components/UserPage'
import Link from 'next/link'
import { makeQuery } from '../utils/api'
import { useSnackbar } from 'notistack'

interface Project {
    id: string
    _id: string
    name: string
    alias: string
    description: string
    incompleteDays: number
    active: boolean
}

export default function page() {
    const [loading, setLoading] = useState(false)
    const [projects, setProjects] = useState<Project[]>([])
    const { enqueueSnackbar } = useSnackbar()

    useEffect(() => {
        makeQuery(
            localStorage.getItem('token'),
            'getUserProjects',
            {},
            enqueueSnackbar,
            (response: Project[]) => {
                setProjects(response)
            },
            setLoading
        )
    }, [])

    return (
        <UserPage>
            <main className="p-4 pb-24">
                <div className="max-w-md mx-auto">
                    <h1 className="text-xl font-bold text-gray-800 my-2">Proyectos asignados</h1>

                    <div className="space-y-4">
                        {projects.map((project) => (
                            <div key={project._id} className="bg-white rounded-lg py-4 shadow-sm flex flex-col">
                                <div className="flex items-center justify-between gap-2 mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${project.active ? 'bg-[#55C157]' : 'bg-gray-400'
                                            }`} />
                                        <span className="text-gray-600 text-sm ml-4">{
                                            project._id.slice(0, 6)
                                        }</span>
                                    </div>
                                    <div className="text-[12px] text-gray-600 mr-5"></div>
                                    <span className="bg-green text-white text-xs px-2 py-2 rounded-full">
                                        {project.name.slice(0, 2).toUpperCase()}
                                    </span>
                                </div>

                                <div className="mb-3">
                                    <span className="font-bold text-gray-800">{project.alias}</span>
                                    {" - "}
                                    <span className="font-normal text-gray-500">{project.description}</span>
                                </div>

                                <Link href={`
                                /home/add-hours?project=${project._id}
                                `} className="w-full bg-green text-center hover:bg-[#5a7a62] text-white py-2 px-4 rounded-xl transition-colors text-base font-medium">
                                    Ver proyecto
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </UserPage>
    )
}
