"use client"

import { Suspense, useEffect, useState } from "react"
import UserPage from "../../components/UserPage"
import SignatureModal from "./SignatureModal"
import { FaClock, FaPlus, FaSearch, FaCheck, FaTrash, FaFileAlt } from "react-icons/fa"
import { makeQuery } from "@/app/utils/api"
import { useSnackbar } from "notistack"
import { useRouter, useSearchParams } from "next/navigation"
import dayjs from "dayjs"
import "dayjs/locale/es"
dayjs.locale("es")

const dayNames: any = {
    sábado: "saturday",
    domingo: "sunday",
    lunes: "monday",
    martes: "tuesday",
    miércoles: "wednesday",
    jueves: "thursday",
    viernes: "friday",
}

type Step = 1 | 2 | 3 | 4

interface Activity {
    id: string
    name: string
    description: string
    startTime: string
    endTime: string
    isOvertime: boolean
}

interface Collaborator {
    _id: string
    name: string
    initials: string
    selected: boolean
}

function Content() {
    const [currentStep, setCurrentStep] = useState<Step>(1)
    const [activities, setActivities] = useState<Activity[]>([])
    const [newActivity, setNewActivity] = useState<Activity>({
        id: Date.now().toString(),
        name: "",
        description: "",
        startTime: "08:00",
        endTime: "17:00",
        isOvertime: false, // Default to regular hours
    })
    const [isActivityFormOpen, setIsActivityFormOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [reportCloseTime, setReportCloseTime] = useState("")
    const [form, setForm] = useState({
        name: `Registro ${dayjs().format("DD/MM/YYYY")}`,
        comments: "",
        collaborators: [] as Collaborator[],
        supervisorName: "",
        startTime: "08:00",
        endTime: "17:00",
    })

    // Signature state
    const [surveyorSignature, setSurveyorSignature] = useState<string>("")
    const [supervisorSignature, setSupervisorSignature] = useState<string>("")
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)
    const [currentSignatureType, setCurrentSignatureType] = useState<"surveyor" | "supervisor">("surveyor")

    const { enqueueSnackbar } = useSnackbar()
    const navigate = useRouter().push
    const searchParams = useSearchParams()
    const project = searchParams.get("project")
    const date = searchParams.get("date")

    const filteredCollaborators = form.collaborators.filter((collab) =>
        collab.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    useEffect(() => {
        getProjectData()
    }, [])

    useEffect(() => {
        console.log("Form data:", form)
    }, [form])


    const getInitHour = () => {
        // * Conseguir la primera hora de inicio de las actividades
        if (activities.length > 0) {
            return activities.reduce((earliest, activity) => (activity.startTime < earliest ? activity.startTime : earliest), activities[0].startTime)
        }   
        
        return "08:00"
    }

    const getEndHour = () => {
        // * Conseguir la última hora de fin de las actividades
        if (activities.length > 0) {
            return activities.reduce((latest, activity) => (activity.endTime > latest ? activity.endTime : latest), activities[0].endTime)
        }   
        
        return "17:00"
    }

    const getProjectData = () => {
        const dateFormat = date ? dayjs(date) : dayjs()
        const dayName = dateFormat.format("dddd")

        makeQuery(localStorage.getItem("token"), "getProject", project || "", enqueueSnackbar, (response) => {
            console.log("Project data:", response)
            const selectedWorkSchedule = response.workSchedule[dayNames[dayName]] || {
                startTime: "00:00",
                endTime: "00:00",
            }

            setForm({
                ...form,
                startTime: selectedWorkSchedule.startTime,
                endTime: selectedWorkSchedule.endTime,
                collaborators: [...response.collaborators, ...response.topographers],
            })
        })
    }

    const handleNext = () => {
        console.log("Current step:", currentStep)
        if (currentStep < 4) {
            setCurrentStep((prev) => (prev + 1) as Step)
        }

        if (currentStep === 4) {
            console.log("Submitting form data...")
            const formData = {
                ...form,
                project,
                date,
                startTime: getInitHour(),
                endTime: getEndHour(),
                activities,
                topographerSignature: surveyorSignature,
                supervisorSignature: supervisorSignature,
                closeTime: reportCloseTime,
            }

            if (activities.length === 0) {
                enqueueSnackbar("Por favor agrega al menos una actividad", { variant: "error" })
                return
            }

            if (!formData.name || !formData.startTime || !formData.endTime || !formData.supervisorName) {
                enqueueSnackbar("Por favor completa todos los campos", { variant: "error" })
                return
            }

            if (formData.startTime >= formData.endTime) {
                enqueueSnackbar("La hora de inicio debe ser menor que la hora de fin", { variant: "error" })
                return
            }

            if (formData.collaborators.length === 0) {
                enqueueSnackbar("Por favor selecciona al menos un colaborador", { variant: "error" })
                return
            }

            if (!formData.topographerSignature || !formData.supervisorSignature) {
                enqueueSnackbar("Por favor firma el documento", { variant: "error" })
                return
            }

            makeQuery(localStorage.getItem("token"), "createWorkEntry", formData, enqueueSnackbar, () => {
                enqueueSnackbar("Actividad creada con éxito", { variant: "success" })
                navigate(`/home/add-hours?project=${project}`)
            })
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as Step)
        }
    }

    const handleCloseReport = () => {
        setReportCloseTime(new Date().toLocaleTimeString())
        setCurrentStep(4)
    }

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
        console.log("Removing collaborator with ID:", _id)
        setForm((prev) => {
            const updatedCollaborators = prev.collaborators.filter((collab) => collab._id !== _id)
            return { ...prev, collaborators: updatedCollaborators }
        })
    }

    const openSignatureModal = (type: "surveyor" | "supervisor") => {
        setCurrentSignatureType(type)
        setIsSignatureModalOpen(true)
    }

    const handleSaveSignature = (signatureData: string) => {
        if (currentSignatureType === "surveyor") {
            setSurveyorSignature(signatureData)
        } else {
            setSupervisorSignature(signatureData)
        }
    }

    const addActivity = () => {
        if (newActivity.name && newActivity.startTime && newActivity.endTime) {
            setActivities([...activities, { ...newActivity, id: Date.now().toString() }])
            setNewActivity({
                id: Date.now().toString(),
                name: "",
                description: "",
                startTime: "08:00",
                endTime: "17:00",
                isOvertime: false,
            })
            setIsActivityFormOpen(false)
        }
    }

    const removeActivity = (id: string) => {
        setActivities(activities.filter((activity) => activity.id !== id))
    }

    const renderStepIndicator = () => {
        return (
            <div className="flex justify-center space-x-2 mb-6">
                {[1, 2, 3, 4].map((step) => (
                    <div
                        key={step}
                        className={`h-1 rounded-full ${step === currentStep ? "w-8 bg-gray-800" : step < currentStep ? "w-8 bg-gray-400" : "w-8 bg-gray-300"
                            }`}
                    />
                ))}
            </div>
        )
    }

    const renderStep1 = () => {
        // Now this is the collaborators step (previously step 3)
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-[#6A8D73] text-center font-medium">Paso 1</h1>
                    <h2 className="text-gray-700 text-center text-sm mb-2">Colaboradores</h2>
                    {renderStepIndicator()}
                </div>

                <div className="relative">
                    <input
                        type="text"
                        className="w-full bg-gray-100 rounded-lg p-3 pl-10"
                        placeholder="Buscar colaboradores"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <FaSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                <div className="space-y-3">
                    {filteredCollaborators
                        .filter((collab) => collab.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((collab) => (
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

                <div className="pt-6 space-y-3">
                    <button
                        className="w-full bg-[#6A8D73] hover:bg-[#5a7a62] text-white rounded-lg py-3 px-4 transition-colors"
                        onClick={handleNext}
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        )
    }

    const renderStep2 = () => {
        // Now this is the activities step (previously step 1)
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-[#6A8D73] text-center font-medium">Paso 2</h1>
                    <h2 className="text-gray-700 text-center text-sm mb-2">Actividades</h2>
                    {renderStepIndicator()}
                </div>

                {/* List of activities */}
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div
                            key={activity.id}
                            className={`${activity.isOvertime ? "bg-amber-50 border border-amber-200" : "bg-gray-100"} rounded-lg p-4`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                    <h3 className="font-medium text-gray-800">{activity.name}</h3>
                                    {activity.isOvertime && (
                                        <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                                            Hora extra
                                        </span>
                                    )}
                                </div>
                                <button className="text-red-500" onClick={() => removeActivity(activity.id)}>
                                    <FaTrash className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <div>
                                    <span className="text-xs text-gray-500">Inicio</span>
                                    <div className="text-sm">{activity.startTime}</div>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">Fin</span>
                                    <div className="text-sm">{activity.endTime}</div>
                                </div>
                            </div>
                            {activity.description && <div className="text-sm text-gray-600 mt-2">{activity.description}</div>}
                        </div>
                    ))}
                </div>

                {/* Add new activity form */}
                {isActivityFormOpen ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                        <div>
                            <label className="text-sm text-gray-600">Nombre de la actividad</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                                value={newActivity.name}
                                onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
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
                        <div>
                            <label className="text-sm text-gray-600">Descripción (opcional)</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                                value={newActivity.description}
                                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                            />
                        </div>

                        {/* Overtime checkbox */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="overtime-checkbox"
                                className="w-4 h-4 text-[#6A8D73] border-gray-300 rounded focus:ring-[#6A8D73]"
                                checked={newActivity.isOvertime}
                                onChange={(e) => setNewActivity({ ...newActivity, isOvertime: e.target.checked })}
                            />
                            <label htmlFor="overtime-checkbox" className="ml-2 text-sm text-gray-700">
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
                                onClick={() => setIsActivityFormOpen(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        className="w-full border border-gray-300 border-dashed rounded-lg p-3 flex items-center justify-center gap-2 text-gray-600"
                        onClick={() => setIsActivityFormOpen(true)}
                    >
                        <FaPlus className="w-4 h-4" />
                        Agregar actividad
                    </button>
                )}

                <div className="space-y-2">
                    <label className="text-sm text-gray-600">Comentarios generales</label>
                    <textarea
                        className="w-full h-24 p-3 bg-gray-100 rounded-lg resize-none"
                        value={form.comments}
                        onChange={(e) => setForm({ ...form, comments: e.target.value })}
                    />
                </div>

                <div className="pt-6 space-y-3">
                    <button
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-3 px-4 transition-colors"
                        onClick={handleBack}
                    >
                        Regresar
                    </button>
                    <button
                        className="w-full bg-[#6A8D73] hover:bg-[#5a7a62] text-white rounded-lg py-3 px-4 transition-colors"
                        onClick={handleNext}
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        )
    }

    const renderStep3 = () => {
        // Now this is the hours step (previously step 2)
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-[#6A8D73] text-center font-medium">Paso 3</h1>
                    <h2 className="text-gray-700 text-center text-sm mb-2">Horas totales</h2>
                    {renderStepIndicator()}
                </div>

                <div className="space-y-3">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-600">Inicio de jornada</label>
                        <div className="relative">
                            <input
                                type="time"
                                className="w-full bg-gray-100 rounded-lg p-3 pr-10"
                                value={getInitHour()}
                                readOnly
                            />
                            <FaClock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-600">Final de jornada</label>
                        <div className="relative">
                            <input
                                type="time"
                                className="w-full bg-gray-100 rounded-lg p-3 pr-10"
                                value={getEndHour()}
                                readOnly
                            />
                            <FaClock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {/* Overtime summary */}
                    {activities.some((activity) => activity.isOvertime) && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                            <div className="flex items-center gap-2">
                                <FaClock className="text-amber-600" />
                                <span className="text-amber-800 font-medium">
                                    {activities.filter((a) => a.isOvertime).length} actividad(es) con horas extras
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-6 space-y-3">
                    <button
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-3 px-4 transition-colors"
                        onClick={handleBack}
                    >
                        Regresar
                    </button>
                    {/* <button
                        className="w-full bg-[#6A8D73] hover:bg-[#5a7a62] text-white rounded-lg py-3 px-4 transition-colors"
                        onClick={handleNext}
                    >
                        Siguiente
                    </button> */}
                    <button
                        className="w-full border border-[#6A8D73] text-[#6A8D73] hover:bg-gray-50 rounded-lg py-3 px-4 transition-colors flex items-center justify-center gap-2"
                        onClick={handleCloseReport}
                    >
                        <FaFileAlt className="w-4 h-4" />
                        Cerrar informe
                    </button>
                </div>
            </div>
        )
    }

    const renderStep4 = () => {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-[#6A8D73] text-center font-medium">Paso 4</h1>
                    <h2 className="text-gray-700 text-center text-sm mb-2">Firmas</h2>
                    {renderStepIndicator()}
                </div>

                {reportCloseTime && (
                    <div className="bg-gray-100 p-3 rounded-lg text-center">
                        <span className="text-sm text-gray-600">Informe cerrado a las {reportCloseTime}</span>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-600 text-center block">Firma del topógrafo</label>
                        <button
                            className="w-full border border-gray-300 rounded-lg p-3 text-[#6A8D73]"
                            onClick={() => openSignatureModal("surveyor")}
                        >
                            {surveyorSignature ? (
                                <img
                                    src={surveyorSignature || "/placeholder.svg"}
                                    alt="Firma del topógrafo"
                                    className="max-h-16 mx-auto"
                                />
                            ) : (
                                "Firma Aquí"
                            )}
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-600 text-center block">Nombre del Supervisor</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-3"
                            value={form.supervisorName}
                            onChange={(e) => setForm({ ...form, supervisorName: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-600 text-center block">Firma del Supervisor</label>
                        <button
                            className="w-full border border-gray-300 rounded-lg p-3 text-[#6A8D73]"
                            onClick={() => openSignatureModal("supervisor")}
                        >
                            {supervisorSignature ? (
                                <img
                                    src={supervisorSignature || "/placeholder.svg"}
                                    alt="Firma del supervisor"
                                    className="max-h-16 mx-auto"
                                />
                            ) : (
                                "Firmar Ahora"
                            )}
                        </button>
                    </div>
                </div>

                <div className="pt-6 space-y-3">
                    <button
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-3 px-4 transition-colors"
                        onClick={handleBack}
                    >
                        Regresar
                    </button>
                    <button className="w-full bg-[#6A8D73] hover:bg-[#5a7a62] text-white rounded-lg py-3 px-4 transition-colors" onClick={handleNext}>
                        Finalizar informe
                    </button>
                </div>
            </div>
        )
    }

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return renderStep1()
            case 2:
                return renderStep2()
            case 3:
                return renderStep3()
            case 4:
                return renderStep4()
            default:
                return renderStep1()
        }
    }

    return (
        <UserPage>
            <div className="min-h-[120vh] bg-white pb-24">
                <div className="max-w-md mx-auto py-6 px-4">{renderCurrentStep()}</div>

                {/* Signature Modal */}
                <SignatureModal
                    isOpen={isSignatureModalOpen}
                    onClose={() => setIsSignatureModalOpen(false)}
                    onSave={handleSaveSignature}
                    title={currentSignatureType === "surveyor" ? "Firma del topógrafo" : "Firma del Supervisor"}
                />
            </div>
        </UserPage>
    )
}

export default function AddActivityPage() {
    return (
        <Suspense fallback={<div></div>}>
            <Content />
        </Suspense>
    )
}