"use client"

import { FaPlus, FaTrash, FaCheck } from "react-icons/fa"
import type { User, UserDayData, Activity } from "../../types"
import Modal from "./Modal"

interface UserEditModalProps {
  isOpen: boolean
  onClose: () => void
  editingUser: UserDayData | null
  users: User[]
  onSave: () => void
  onAddActivity: () => void
  onRemoveActivity: (activityId: number) => void
  onActivityChange: (activityId: number, field: keyof Activity, value: string) => void
  onUserChange: (field: keyof UserDayData, value: any) => void
}

export default function UserEditModal({
  isOpen,
  onClose,
  editingUser,
  users,
  onSave,
  onAddActivity,
  onRemoveActivity,
  onActivityChange,
  onUserChange,
}: UserEditModalProps) {
  if (!editingUser) return null

  const user = users.find((u) => u.id === editingUser.userId)

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl">
        <h3 className="text-lg font-bold mb-4">Editar Información - {user?.name}</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Entrada</label>
              <input
                type="time"
                value={editingUser.startTime}
                onChange={(e) => onUserChange("startTime", e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Salida</label>
              <input
                type="time"
                value={editingUser.endTime}
                onChange={(e) => onUserChange("endTime", e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Actividades</label>
              <button
                type="button"
                onClick={onAddActivity}
                className="text-violet-600 hover:text-violet-800 text-sm flex items-center"
              >
                <FaPlus className="mr-1" /> Agregar Actividad
              </button>
            </div>

            {editingUser.activities.map((activity, index) => (
              <div key={activity.id} className="mb-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <label className="block text-sm font-medium text-gray-700">Actividad {index + 1}</label>
                  <button
                    type="button"
                    onClick={() => onRemoveActivity(activity.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
                <input
                  type="text"
                  value={activity.description}
                  onChange={(e) => onActivityChange(activity.id, "description", e.target.value)}
                  placeholder="Descripción de la actividad"
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <textarea
                  value={activity.comments}
                  onChange={(e) => onActivityChange(activity.id, "comments", e.target.value)}
                  placeholder="Comentarios (opcional)"
                  className="w-full p-2 border rounded"
                  rows={2}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios Generales</label>
            <textarea
              value={editingUser.comments}
              onChange={(e) => onUserChange("comments", e.target.value)}
              placeholder="Comentarios generales sobre el día de trabajo"
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSave}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <FaCheck className="mr-2" /> Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
