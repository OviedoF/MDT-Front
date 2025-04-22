"use client"

import { Suspense, useEffect, useState } from "react"
import UserPage from "../../components/UserPage"
import { FaClock, FaPlus, FaSearch, FaCheck, FaTrash } from "react-icons/fa"
import { makeQuery } from "@/app/utils/api"
import { useSnackbar } from "notistack"
import SignatureModal from "./SignatureModal"
import { useRouter, useSearchParams } from "next/navigation"
import dayjs from "dayjs"
import 'dayjs/locale/es'
dayjs.locale("es")

const dayNames: any = {
    "sábado": "saturday",
    "domingo": "sunday",
    "lunes": "monday",
    "martes": "tuesday",
    "miércoles": "wednesday",
    "jueves": "thursday",
    "viernes": "friday",
}

type Step = 1 | 2 | 3 | 4

interface Collaborator {
    _id: string
    name: string
    initials: string
    selected: boolean
}

function Content() {
    const [currentStep, setCurrentStep] = useState<Step>(1)
    const [topographerSignature, setTopographerSignature] = useState(false)
    const [supervisorSignature, setSupervisorSignature] = useState(false)
    const [form, setForm] = useState({
        name: "",
        comments: "",
        startTime: "08:00",
        endTime: "17:00",
        collaborators: [] as Collaborator[],
        topographerSignature: '',
        supervisorSignature: '',
        supervisorName: "",
    })
    const [searchQuery, setSearchQuery] = useState("")
    const { enqueueSnackbar } = useSnackbar()
    const navigate = useRouter().push
    const searchParams = useSearchParams()
    const project = searchParams.get("project")
    const date = searchParams.get("date")

    const filteredCollaborators = form.collaborators.filter((collab) =>
        collab.name.toLowerCase().includes(searchQuery.toLowerCase()) || collab.initials.toLowerCase().includes(searchQuery.toLowerCase())
    )

    useEffect(() => {
        getProjectData()
    }, []);

    useEffect(() => {
        console.log("Form data:", form)
    }, [form])

    const getProjectData = () => {
        const dateFormat = date ? dayjs(date) : dayjs()
        const dayName = dateFormat.format("dddd")

        makeQuery(
            localStorage.getItem("token"),
            'getProject',
            project || '',
            enqueueSnackbar,
            (response) => {
                const selectedWorkSchedule = response.workSchedule[dayNames[dayName]] || {
                    startTime: "00:00",
                    endTime: "00:00",
                }

                setForm({
                    ...form,
                    startTime: selectedWorkSchedule.startTime,
                    endTime: selectedWorkSchedule.endTime,
                    collaborators: response.collaborators
                })
            },
        )
    }

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep((prev) => (prev + 1) as Step)
        }

        if (currentStep === 4) {
            const formData = {
                ...form,
                project,
                date,
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

            if (!formData.topographerSignature && !formData.supervisorSignature) {
                enqueueSnackbar("Por favor firma el documento", { variant: "error" })
                return
            }

            makeQuery(
                localStorage.getItem("token"),
                "createWorkEntry",
                formData,
                enqueueSnackbar,
                () => {
                    enqueueSnackbar("Actividad creada con éxito", { variant: "success" })
                    navigate(`/home/add-hours?project=${project}`)
                },
            )
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as Step)
        }
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
        setForm((prev) => {
            const updatedCollaborators = prev.collaborators.filter((collab) => collab._id !== _id)
            return { ...prev, collaborators: updatedCollaborators }
        })
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
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-[#6A8D73] text-center font-medium">Paso 1</h1>
                    <h2 className="text-gray-700 text-center text-sm mb-2">Descripción de la actividad</h2>
                    {renderStepIndicator()}
                </div>


                <div className="mb-10">
                    <label className="text-sm text-gray-600">Nombre</label>

                    <input
                        className="w-full h-10 p-3 border bg-gray-100 rounded-lg"
                        placeholder="Nombre de la actividad"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-gray-600">Comentarios</label>
                    <textarea
                        placeholder="Comentarios adicionales"
                        className="w-full h-24 p-3 bg-gray-100 rounded-lg resize-none"
                        value={form.comments}
                        onChange={(e) => setForm({ ...form, comments: e.target.value })}
                    />
                </div>

                <button
                    className="w-full bg-[#6A8D73] hover:bg-[#5a7a62] text-white font-bold rounded-lg py-3 px-4 transition-colors"
                    onClick={handleNext}
                >
                    Siguiente
                </button>
            </div>
        )
    }

    const renderStep2 = () => {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-[#6A8D73] text-center font-medium">Paso 2</h1>
                    <h2 className="text-gray-700 text-center text-sm mb-2">Horas</h2>
                    {renderStepIndicator()}
                </div>

                <div className="space-y-3">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-600">Inicio</label>
                        <div className="relative ">
                            <input
                                type="time"
                                className="w-full bg-gray-100 rounded-lg p-3 pr-10"
                                value={form.startTime}
                                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-600">Final</label>
                        <div className="relative">
                            <input
                                type="time"
                                className="w-full bg-gray-100 rounded-lg p-3 pr-10"
                                value={form.endTime}
                                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 space-y-3">
                    <button
                        className="w-full bg-gray-100 hover:bg-gray-200 text-[#6A8D73] font-bold rounded-lg py-3 px-4 transition-colors"
                        onClick={handleBack}
                    >
                        Regresar
                    </button>
                    <button
                        className="w-full bg-[#6A8D73] hover:bg-[#5a7a62] text-white font-bold rounded-lg py-3 px-4 transition-colors"
                        onClick={handleNext}
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        )
    }

    const renderStep3 = () => {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-[#6A8D73] text-center font-medium">Paso 3</h1>
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

                <div className="pt-6 space-y-3">
                    <button
                        className="w-full bg-gray-100 hover:bg-gray-200 text-[#6A8D73] font-bold rounded-lg py-3 px-4 transition-colors"
                        onClick={handleBack}
                    >
                        Regresar
                    </button>
                    <button
                        className="w-full bg-[#6A8D73] hover:bg-[#5a7a62] text-white font-bold rounded-lg py-3 px-4 transition-colors"
                        onClick={handleNext}
                    >
                        Siguiente
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

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-600 text-center block">Firma del topógrafo</label>
                        <button className="w-full border border-gray-300 font-bold rounded-lg p-3 text-[#6A8D73]" onClick={
                            () => setTopographerSignature(true)
                        }>Firma Aquí</button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-600 text-center block">Nombre del Supervisor</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-3"
                            value={form.supervisorName}
                            onChange={(e) => setForm({ ...form, supervisorName: e.target.value })}
                            placeholder="Nombre del supervisor"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-600 text-center block">Firma del Supervisor</label>
                        <button className="w-full border border-gray-300 rounded-lg p-3 font-bold text-[#6A8D73]" onClick={
                            () => setSupervisorSignature(true)
                        }>Firmar Ahora</button>
                    </div>
                </div>

                <div className="pt-6 space-y-3">
                    <button
                        className="w-full bg-gray-100 hover:bg-gray-200 text-[#6A8D73] font-bold rounded-lg py-3 px-4 transition-colors"
                        onClick={handleBack}
                    >
                        Regresar
                    </button>
                    <button
                        className="w-full bg-[#6A8D73] hover:bg-[#5a7a62] text-white font-bold rounded-lg py-3 px-4 transition-colors"
                        onClick={handleNext}
                    >
                        Siguiente
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
                <div className=" bg-white p-4">
                    <div className="max-w-md mx-auto py-6">{renderCurrentStep()}</div>

                    {topographerSignature && <SignatureModal isOpen={topographerSignature} onClose={() => setTopographerSignature(false)} onSave={(data) => setForm({
                        ...form,
                        topographerSignature: data,
                    })} title="Firma del Topógrafo" />}

                    {supervisorSignature && <SignatureModal isOpen={supervisorSignature} onClose={() => setSupervisorSignature(false)} onSave={(data) => setForm({
                        ...form,
                        supervisorSignature: data,
                    })} title="Firma del Supervisor" />}
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

