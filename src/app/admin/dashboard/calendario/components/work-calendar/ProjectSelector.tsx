"use client"

import { FaCalendarAlt } from "react-icons/fa"
import type { Project } from "../../types"

interface ProjectSelectorProps {
  projects: Project[]
  selectedProject: string
  onProjectChange: (projectId: string) => void
}

export default function ProjectSelector({ projects, selectedProject, onProjectChange }: ProjectSelectorProps) {
  return (
    <div className="mb-4 bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <FaCalendarAlt className="text-violet-600 mr-2" />
        <h2 className="text-xl font-bold">Calendario de Actividades</h2>
      </div>

      <div className="mb-4">
        <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Proyecto
        </label>
        <select
          id="project"
          value={selectedProject}
          onChange={(e) => onProjectChange(e.target.value)}
          className="w-full md:w-64 p-2 border rounded"
        >
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.alias}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-200 mr-1 rounded"></div>
          <span className="text-sm">Completo</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-200 mr-1 rounded"></div>
          <span className="text-sm">Incompleto</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-200 mr-1 rounded"></div>
          <span className="text-sm">Informe Enviado</span>
        </div>
      </div>
    </div>
  )
}
