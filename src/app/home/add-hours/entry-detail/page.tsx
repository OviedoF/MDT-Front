"use client"

import { Suspense, useEffect, useState } from "react"
import UserPage from "../../components/UserPage"
import SignatureModal from "../add-activity/SignatureModal"
import { FaClock, FaCheck, FaEdit, FaTrash, FaPlus } from "react-icons/fa"
import { useSearchParams } from "next/navigation"
import { makeQuery } from "@/app/utils/api"
import { useSnackbar } from "notistack"
import CollaboratorsModal from "./CollaboratorsModal"
import type { DayDetails } from '../../../admin/dashboard/calendario/types'
import PdfPreviewModal from "../add-activity/PdfPreviewModal"

interface User {
  _id: string
  name: string
}

interface Activity {
  _id?: string
  name: string
  description: string
  startTime: string
  endTime: string
  isOvertime: boolean
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
  activities: Activity[]
  closeTime?: string
}

function Content() {
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
    activities: [],
  })
  const [editingCollaborators, setEditingCollaborators] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [isAddingActivity, setIsAddingActivity] = useState(false)
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<DayDetails | null>(null)
  const [newActivity, setNewActivity] = useState<Activity>({
    name: "",
    description: "",
    startTime: "08:00",
    endTime: "17:00",
    isOvertime: false,
  })
  const searchParams = useSearchParams()
  const entryId = searchParams.get("entryId")
  const { enqueueSnackbar } = useSnackbar()

  const getEntryDetails = async () => {
    makeQuery(localStorage.getItem("token"), "getWorkEntry", entryId || "", enqueueSnackbar, (data) => {
      makeQuery(
        localStorage.getItem("token"),
        "getDailySummaryFromEntry",
        { _id: data._id },
        enqueueSnackbar,
        (summaryData: DayDetails) => {
          setPreviewData(summaryData)
        },
      )

      // Si no hay actividades, inicializamos como array vacío
      setEntry({
        ...data,
        activities: data.activities || [],
      })
    })
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
      "updateWorkEntry",
      {
        _id: entry._id,
        [currentSignatureType === "surveyor" ? "topographerSignature" : "supervisorSignature"]: signatureData,
      },
      enqueueSnackbar,
      () => {
        getEntryDetails()
        enqueueSnackbar(`${currentSignatureType === "surveyor" ? "Topógrafo" : "Supervisor"} firmado correctamente`, {
          variant: "success",
        })
        setIsSignatureModalOpen(false)
      },
    )
  }

  const handleSaveCollaborators = (data: any) => {
    const selectedCollaborators = data

    makeQuery(
      localStorage.getItem("token"),
      "updateWorkEntry",
      {
        _id: entry._id,
        collaborators: selectedCollaborators,
      },
      enqueueSnackbar,
      (response: WorkEntry) => {
        console.log("Colaboradores actualizados", response.collaborators)
        console.log("entry", entry.collaborators)
        setEntry({
          ...entry,
          collaborators: response.collaborators
        })
        enqueueSnackbar("Colaboradores actualizados correctamente", { variant: "success" })
        setEditingCollaborators(false)
      },
    )
  }

  const saveEntry = () => {
    makeQuery(
      localStorage.getItem("token"),
      "updateWorkEntry",
      {
        _id: entry._id,
        name: entry.name,
        startTime: entry.startTime,
        endTime: entry.endTime,
        comments: entry.comments,
        activities: entry.activities,
      },
      enqueueSnackbar,
      () => {
        getEntryDetails()
        enqueueSnackbar("Entrada actualizada correctamente", { variant: "success" })
        setEditing(false)
      },
    )
  }
  const getInitHour = () => {
    // * Conseguir la primera hora de inicio de las actividades
    const startHour = entry.activities.reduce((prev, curr) => {
      if (prev.startTime < curr.startTime) return prev
      return curr
    }, entry.activities[0])
    return startHour.startTime
  }

  const getEndHour = () => {
    // * Conseguir la última hora de fin de las actividades
    const endHour = entry.activities.reduce((prev, curr) => {
      if (prev.endTime > curr.endTime) return prev
      return curr
    }, entry.activities[0])
    return endHour.endTime
  }

  const addActivity = () => {
    if (!newActivity.name || !newActivity.description || !newActivity.startTime || !newActivity.endTime) {
      enqueueSnackbar("Por favor completa todos los campos de la actividad", { variant: "error" })
      return
    }

    const updatedActivities = [...entry.activities, { ...newActivity }]
    setEntry({ ...entry, activities: updatedActivities, startTime: getInitHour(), endTime: getEndHour() })
    setNewActivity({
      name: "",
      description: "",
      startTime: "08:00",
      endTime: "17:00",
      isOvertime: false,
    })
    setIsAddingActivity(false)
  }

  const updateActivity = () => {
    if (!editingActivity) return

    const updatedActivities = entry.activities.map((activity, index) => {
      if (activity._id === editingActivity._id) {
        return editingActivity
      }
      return activity
    })

    setEntry({ ...entry, activities: updatedActivities, startTime: getInitHour(), endTime: getEndHour() })
    setEditingActivity(null)
  }

  const removeActivity = (activityId: string | undefined) => {
    if (!activityId) return

    const updatedActivities = entry.activities.filter((activity) => activity._id !== activityId)
    setEntry({ ...entry, activities: updatedActivities, startTime: getInitHour(), endTime: getEndHour() })
    enqueueSnackbar("Actividad eliminada correctamente", { variant: "success" })
  }

  const getWeekday = (date: string) => {
    const day = new Date(date).getDay()
    const weekdays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    return weekdays[day]
  }

  const handlePreview = () => {
    setIsPdfPreviewOpen(true)
  };

  return (
    <UserPage>
      {/* Date Header */}
      <div className="bg-gray-100 p-4 flex items-center justify-center">
        <div className="text-center flex gap-5">
          <div className="text-4xl font-bold text-gray-700">{entry.date.split("-")[2]}</div>

          <div className="text-gray-600 text-left">
            {getWeekday(entry.date)}
            <br />
            {new Date(entry.date).toLocaleString("es-ES", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      <div className="bg-white min-h-screen pb-20">
        <div className="max-w-md mx-auto py-6 px-4">
          {/* Time Entry */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-2">Inicio de jornada</label>
                <div className="relative">
                  <input
                    type="time"
                    value={entry.startTime}
                    readOnly={!editing}
                    onChange={(e) => setEntry({ ...entry, startTime: e.target.value })}
                    className="w-full bg-gray-100 rounded-lg p-3 pr-10"
                  />
                  <FaClock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-2">Final de jornada</label>
                <div className="relative">
                  <input
                    type="time"
                    value={entry.endTime}
                    readOnly={!editing}
                    onChange={(e) => setEntry({ ...entry, endTime: e.target.value })}
                    className="w-full bg-gray-100 rounded-lg p-3 pr-10"
                  />
                  <FaClock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Entry Name */}
          <div className="mb-6">
            <label className="text-sm text-gray-600 block mb-2">Nombre del informe</label>
            <input
              type="text"
              onChange={(e) => setEntry({ ...entry, name: e.target.value })}
              readOnly={!editing}
              value={entry.name}
              className="bg-gray-100 w-full rounded-lg p-3 text-center text-gray-700"
            />
          </div>

          {/* Activities Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-600">Actividades</label>
              {editing && (
                <button
                  onClick={() => setIsAddingActivity(true)}
                  className="text-[#6A8D73] hover:text-[#5a7a62] flex items-center gap-1 text-sm"
                >
                  <FaPlus className="w-3 h-3" /> Agregar
                </button>
              )}
            </div>

            {/* Activities List */}
            <div className="space-y-3">
              {entry.activities.length === 0 ? (
                <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
                  No hay actividades registradas
                </div>
              ) : (
                entry.activities.map((activity, index) => (
                  <div
                    key={activity._id || index}
                    className={`${activity.isOvertime ? "bg-amber-50 border border-amber-200" : "bg-gray-100"
                      } rounded-lg p-4 relative`}
                  >
                    {/* Activity Header */}
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-800">{activity.name}</h3>
                      {editing && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingActivity(activity)}
                            className="text-[#6A8D73] hover:text-[#5a7a62]"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeActivity(activity._id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Activity Details */}
                    <div className="text-sm text-gray-600 mb-2">{activity.description}</div>

                    {/* Activity Times */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-xs text-gray-500">Inicio: </span>
                        {activity.startTime}
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Fin: </span>
                        {activity.endTime}
                      </div>
                    </div>

                    {/* Overtime Badge */}
                    {activity.isOvertime && (
                      <span className="absolute top-2 right-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                        Hora extra
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add Activity Form */}
            {isAddingActivity && (
              <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Nombre de la actividad</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                    value={newActivity.name}
                    onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Descripción</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">Hora inicio</label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                      value={newActivity.startTime}
                      onChange={(e) => setNewActivity({ ...newActivity, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Hora fin</label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                      value={newActivity.endTime}
                      onChange={(e) => setNewActivity({ ...newActivity, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="new-overtime-checkbox"
                    className="w-4 h-4 text-[#6A8D73] border-gray-300 rounded focus:ring-[#6A8D73]"
                    checked={newActivity.isOvertime}
                    onChange={(e) => setNewActivity({ ...newActivity, isOvertime: e.target.checked })}
                  />
                  <label htmlFor="new-overtime-checkbox" className="ml-2 text-sm text-gray-700">
                    Marcar como hora extra
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-[#6A8D73] hover:bg-[#5a7a62] text-white rounded-lg py-2 transition-colors"
                    onClick={addActivity}
                  >
                    Agregar
                  </button>
                  <button
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg py-2 transition-colors"
                    onClick={() => setIsAddingActivity(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Edit Activity Form */}
            {editingActivity && (
              <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Nombre de la actividad</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                    value={editingActivity.name}
                    onChange={(e) => setEditingActivity({ ...editingActivity, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Descripción</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                    value={editingActivity.description}
                    onChange={(e) => setEditingActivity({ ...editingActivity, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">Hora inicio</label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                      value={editingActivity.startTime}
                      onChange={(e) => setEditingActivity({ ...editingActivity, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Hora fin</label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                      value={editingActivity.endTime}
                      onChange={(e) => setEditingActivity({ ...editingActivity, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-overtime-checkbox"
                    className="w-4 h-4 text-[#6A8D73] border-gray-300 rounded focus:ring-[#6A8D73]"
                    checked={editingActivity.isOvertime}
                    onChange={(e) => setEditingActivity({ ...editingActivity, isOvertime: e.target.checked })}
                  />
                  <label htmlFor="edit-overtime-checkbox" className="ml-2 text-sm text-gray-700">
                    Marcar como hora extra
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-[#6A8D73] hover:bg-[#5a7a62] text-white rounded-lg py-2 transition-colors"
                    onClick={updateActivity}
                  >
                    Guardar
                  </button>
                  <button
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg py-2 transition-colors"
                    onClick={() => setEditingActivity(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="mb-6">
            <label className="text-sm text-gray-600 block mb-2">Comentarios generales</label>
            <textarea
              className="bg-gray-100 rounded-lg p-3 h-32 w-full"
              value={entry.comments}
              readOnly={!editing}
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

              <FaEdit
                onClick={() => setEditingCollaborators(true)}
                className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Signatures */}
          <div className="mb-6">
            <label className="text-sm text-gray-600 block mb-2">Firmas</label>
            <div className="flex justify-evenly">
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Topógrafo</span>
                <FaCheck className={`${entry.topographerSignature ? "text-green-500" : "text-gray-300"}`} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Supervisor</span>
                <FaCheck className={`${entry.supervisorSignature ? "text-green-500" : "text-gray-300"}`} />
              </div>
            </div>
          </div>

          {/* Close Time */}
          {entry.closeTime && (
            <div className="mb-6">
              <div className="bg-gray-100 p-3 rounded-lg text-center">
                <span className="text-sm text-gray-600">Informe cerrado a las {entry.closeTime}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!entry.topographerSignature && (
              <button
                className="w-full border border-[#6A8D73] text-[#6A8D73] rounded-lg py-3 px-4 transition-colors"
                onClick={() => openSignatureModal("surveyor")}
              >
                Firmar como topógrafo
              </button>
            )}

            {!entry.supervisorSignature && (
              <button
                className="w-full border border-[#6A8D73] text-[#6A8D73] rounded-lg py-3 px-4 transition-colors"
                onClick={() => openSignatureModal("supervisor")}
              >
                Firmar como supervisor
              </button>
            )}

            {!editing && (
              <button
                className="w-full bg-[#6A8D73] hover:bg-[#5a7a62] text-white rounded-lg py-3 px-4 transition-colors"
                onClick={() => setEditing(true)}
              >
                Editar
              </button>
            )}

            {editing && (
              <button
                className="w-full bg-green-500 hover:bg-[#5a7a62] text-white rounded-lg py-3 px-4 transition-colors"
                onClick={saveEntry}
              >
                Guardar
              </button>
            )}
          </div>

          <button
            className="w-full bg-gray-100 mt-5 hover:bg-gray-200 text-gray-700 rounded-lg py-3 px-4 transition-colors"
            onClick={handlePreview}
          >
            Previsualizar
          </button>
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

        {previewData && <PdfPreviewModal
          isOpen={isPdfPreviewOpen}
          onClose={() => setIsPdfPreviewOpen(false)}
          selectedDate={new Date(entry.date)}
          project={entry.name}
          dayData={previewData}
        />}
      </div>
    </UserPage>
  )
}

export default function Page() {
  return (
    <Suspense>
      <Content />
    </Suspense>
  )
}