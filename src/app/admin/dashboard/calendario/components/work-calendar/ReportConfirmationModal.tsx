"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Project } from "../../types"
import Modal from "./Modal"

interface ReportConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  selectedDate: Date | null
  selectedProject: string
  projects: Project[]
}

export default function ReportConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  selectedDate,
  selectedProject,
  projects,
}: ReportConfirmationModalProps) {
  if (!selectedDate) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-96 text-center w-full">
        <h3 className="text-lg font-bold mb-4">Confirmar Envío de Informe</h3>
        <p>
          ¿Estás seguro de que deseas enviar el informe del día {format(selectedDate, "d 'de' MMMM", { locale: es })}?
        </p>
        <div className="flex justify-end mt-4">
          <button
            onClick={onConfirm}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Enviar
          </button>
          <button onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  )
}
