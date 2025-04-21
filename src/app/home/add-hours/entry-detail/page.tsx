"use client"

import { useEffect, useState } from "react"
import UserPage from "../../components/UserPage"
import SignatureModal from "../add-activity/SignatureModal"
import { FaClock, FaCheck, FaEdit } from "react-icons/fa"
import { useSearchParams } from "next/navigation"
import { makeQuery } from "@/app/utils/api"
import { useSnackbar } from "notistack"
import CollaboratorsModal from "./CollaboratorsModal"

interface User {
  _id: string
  name: string
}

interface WorkEntry {
  _id: string
  name: string
  date: string
  startTime: string
  endTime: string
  comments: string
  supervisorSignature: string | null
  topographerSignature: string | null
  collaborators: User[]
}

export default function TimeEntryDetailPage() {
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)
  const [currentSignatureType, setCurrentSignatureType] = useState<"surveyor" | "supervisor">("surveyor")
  const [entry, setEntry] = useState<WorkEntry>({
    _id: "",
    name: " ",
    date: "",
    startTime: "",
    endTime: "",
    comments: "",
    supervisorSignature: null,
    topographerSignature: null,
    collaborators: [],
  })
  const [editingCollaborators, setEditingCollaborators] = useState(false)
  const [editing, setEditing] = useState(false)
  const searchParams = useSearchParams()
  const entryId = searchParams.get("entryId")
  const { enqueueSnackbar } = useSnackbar()

  const getEntryDetails = async () => {
    makeQuery(
      localStorage.getItem("token"),
      'getWorkEntry',
      entryId,
      enqueueSnackbar,
      (data) => {
        setEntry(data)
      },
    )
  }

  useEffect(() => {
    getEntryDetails()
  }, [])

  const openSignatureModal = (type: "surveyor" | "supervisor") => {
    setCurrentSignatureType(type)
    setIsSignatureModalOpen(true)
  }

  const handleSaveSignature = (signatureData: string) => {
    makeQuery(
      localStorage.getItem("token"),
      'updateWorkEntry',
      {
        _id: entry._id,
        [
          currentSignatureType === "surveyor" ? "topographerSignature" : "supervisorSignature"
        ]: signatureData,
      },
      enqueueSnackbar,
      () => {
        getEntryDetails()
        enqueueSnackbar(
          `${currentSignatureType === "surveyor" ? "Topógrafo" : "Supervisor"} firmado correctamente`,
          { variant: "success" },
        )
        setIsSignatureModalOpen(false)
      },
    )
  }

  const handleSaveCollaborators = (data: any) => {
    const selectedCollaborators = data

    makeQuery(
      localStorage.getItem("token"),
      'updateWorkEntry',
      {
        _id: entry._id,
        collaborators: selectedCollaborators,
      },
      enqueueSnackbar,
      () => {
        getEntryDetails()
        enqueueSnackbar("Colaboradores actualizados correctamente", { variant: "success" })
        setEditingCollaborators(false)
      },
    )
  }

  const saveEntry = () => {
    makeQuery(
      localStorage.getItem("token"),
      'updateWorkEntry',
      {
        _id: entry._id,
        name: entry.name,
        startTime: entry.startTime,
        endTime: entry.endTime,
        comments: entry.comments,
      },
      enqueueSnackbar,
      () => {
        getEntryDetails()
        enqueueSnackbar("Entrada actualizada correctamente", { variant: "success" })
        setEditing(false)
      },
    )
  }

  return (
    <UserPage>
      {/* Date Header */}
      <div className="bg-gray-100 p-4 flex items-center justify-center">
        <div className="text-center flex gap-5">
          <div className="text-4xl font-bold text-gray-700">
            {entry.date.split("-")[2]}
          </div>

          <div className="text-gray-600 text-left">
            {new Date(entry.date).toLocaleString("es-ES", {
              weekday: "long",
            })}
            <br />
            {new Date(entry.date).toLocaleString("es-ES", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      <div className="bg-white h-[800px]">
        <div className="max-w-md py-6 px-4">
          {/* Time Entry */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-2">Inicio</label>
                <div className="relative">
                  <input type="text" value={
                    entry.startTime
                  } readOnly={
                    !editing
                  } 
                  onChange={(e) => setEntry({ ...entry, startTime: e.target.value })}
                  className="w-full bg-gray-100 rounded-lg p-3 pr-10" />
                  <FaClock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-2">Final</label>
                <div className="relative">
                  <input type="text" value={
                    entry.endTime
                  } readOnly={
                    !editing
                  } 
                  onChange={(e) => setEntry({ ...entry, endTime: e.target.value })}
                  className="w-full bg-gray-100 rounded-lg p-3 pr-10" />
                  <FaClock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Activities */}
          <div className="mb-6">
            <label className="text-sm text-gray-600 block mb-2">Actividad</label>
            <input
              type="text"
              onChange={(e) => setEntry({ ...entry, name: e.target.value })}
              readOnly={!editing}
              value={entry.name}
              className="bg-gray-100 w-full rounded-lg p-3 text-center text-gray-700"
            />
          </div>

          {/* Comments */}
          <div className="mb-6">
            <label className="text-sm text-gray-600 block mb-2">Comentarios</label>
            <textarea className="bg-gray-100 rounded-lg p-3 h-32 w-full" value={
              entry.comments
            } readOnly={
              !editing
            }
            onChange={(e) => setEntry({ ...entry, comments: e.target.value })}
            ></textarea>
          </div>

          {/* Collaborators */}
          <div className="mb-6">
            <label className="text-sm text-gray-600 block mb-2">Colaboradores</label>

            <div className="bg-gray-100 rounded-lg p-3 text-center text-gray-700 pr-10 relative">
              <div className="flex items-center gap-2 border-b py-2">
                {entry.collaborators.map((collaborator) => (
                  <span key={collaborator._id}>
                    {collaborator.name}
                    {entry.collaborators[entry.collaborators.length - 1].name !== collaborator.name ? ", " : ""}
                  </span>
                ))}
              </div>

              <FaEdit onClick={
                () => setEditingCollaborators(true)
              } className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Signatures */}
          <div className="mb-6">
            <label className="text-sm text-gray-600 block mb-2">Firmas</label>
            <div className="flex justify-evenly">
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Topógrafo</span>
                <FaCheck className={
                  `${entry.topographerSignature ? "text-green-500" : "text-gray-300"}`
                } />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Supervisor</span>
                <FaCheck className={
                  `${entry.supervisorSignature ? "text-green-500" : "text-gray-300"}`
                } />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {
              !entry.topographerSignature && <button
                className="w-full border border-[#6A8D73] text-[#6A8D73] rounded-lg py-3 px-4 transition-colors"
                onClick={() => openSignatureModal("surveyor")}
              >
                Firmar como topógrafo
              </button>
            }

            {
              !entry.supervisorSignature && <button
                className="w-full border border-[#6A8D73] text-[#6A8D73] rounded-lg py-3 px-4 transition-colors"
                onClick={() => openSignatureModal("supervisor")}
              >
                Firmar como supervisor
              </button>
            }

            {
              !editing && <button
                className="w-full bg-[#6A8D73] hover:bg-[#5a7a62] text-white rounded-lg py-3 px-4 transition-colors"
                onClick={() => setEditing(true)}
              >
                Editar
              </button>
            }

            {
              editing && <button
                className="w-full bg-green-500 hover:bg-[#5a7a62] text-white rounded-lg py-3 px-4 transition-colors"
                onClick={() => saveEntry()}
              >
                Guardar
              </button>
            }
          </div>
        </div>

        {/* Signature Modal */}
        <SignatureModal
          isOpen={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          onSave={handleSaveSignature}
          title={currentSignatureType === "surveyor" ? "Firma del topógrafo" : "Firma del Supervisor"}
        />

        <CollaboratorsModal
          isOpen={editingCollaborators}
          onClose={() => setEditingCollaborators(false)}
          onSave={handleSaveCollaborators}
          title="Colaboradores"
        />
      </div>
    </UserPage>
  )
}
