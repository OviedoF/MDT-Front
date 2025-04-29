"use client"

import { makeQuery } from "@/app/utils/api"
import { useSnackbar } from "notistack"
import type React from "react"

import { useRef, useState, useEffect } from "react"
import { FaCheck, FaSearch, FaTrash } from "react-icons/fa"

interface SignatureModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: string[]) => void
  title: string
}

export default function CollaboratorsModal({ isOpen, onClose, onSave, title }: SignatureModalProps) {
  const [form, setForm] = useState({
    collaborators: [
      { _id: "1", name: "John Doe", initials: "JD", selected: false },
      { _id: "2", name: "Jane Smith", initials: "JS", selected: false },
      { _id: "3", name: "Alice Johnson", initials: "AJ", selected: false },
      { _id: "4", name: "Bob Brown", initials: "BB", selected: false },
    ],
  })
  const [searchQuery, setSearchQuery] = useState("")
  const { enqueueSnackbar } = useSnackbar()

  const filteredCollaborators = form.collaborators.filter((collab) =>
    collab.name.toLowerCase().includes(searchQuery.toLowerCase()) || collab.initials.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    const token = localStorage.getItem("token");
    makeQuery(
      token,
      "getCollaborators",
      "",
      enqueueSnackbar,
      (data) => setForm({
        ...form,
        collaborators: data.map((collab: any) => ({
          _id: collab._id,
          name: collab.name,
          initials: collab.name.slice(0, 2).toUpperCase(),
          selected: false,
        }))
      }),
    );
  }, [isOpen]);

  if (!isOpen) return null

  const toggleCollaborator = (_id: string) => {
    setForm((prev) => {
      const updatedCollaborators = prev.collaborators.map((collab) => {
        if (collab._id === _id) {
          return { ...collab, selected: !collab.selected }
        }
        return collab
      })
      return { ...prev, collaborators: updatedCollaborators }
    })
  }

  const removeCollaborator = (_id: string) => {
    setForm((prev) => {
      const updatedCollaborators = prev.collaborators.filter((collab) => collab._id !== _id)
      return { ...prev, collaborators: updatedCollaborators }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-[90%] max-w-md max-h-[80vh] flex flex-col">
        {/* Modal header */}
        <div className="p-4 border-b">
          <h2 className="text-center font-medium text-gray-800">{title}</h2>
        </div>


        <div className="relative p-4">
          <input
            type="text"
            className="w-full bg-gray-100 rounded-lg p-3 pl-10"
            placeholder="Buscar colaboradores"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="w-4 h-4 absolute left-3 ml-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="space-y-3 p-5 overflow-y-auto h-[30vh]">
          {filteredCollaborators.map((collab) => (
            <div key={collab._id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#6A8D73] rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {collab.initials}
                </div>
                <span className="text-gray-700">{collab.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-green-500" onClick={() => toggleCollaborator(collab._id)}>
                  <FaCheck className="w-4 h-4" />
                </button>
                <button className="text-gray-400" onClick={() => removeCollaborator(collab._id)}>
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="p-4 space-y-2">
          <button
            className="w-full bg-[#6A8D73] hover:bg-[#5a7a62] text-white rounded-lg py-3 transition-colors"
            onClick={
              () => {
                const selectedCollaborators = filteredCollaborators.map((collab) => collab._id)
                onSave(selectedCollaborators)
                onClose()
              }
            }
          >
            Aceptar
          </button>

          <button className="w-full text-gray-600 py-2 text-sm" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}