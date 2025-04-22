"use client"

import UserPage from "@/app/home/components/UserPage"
import { makeQuery } from "@/app/utils/api"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useSnackbar } from "notistack"
import { Suspense, useEffect, useRef, useState } from "react"
import { FaArrowLeft, FaClock, FaPencilAlt } from "react-icons/fa"

interface WorkEntry {
  _id: string
  supervisorName: string
  name: string
  comments: string
  date: string
  startTime: string
  endTime: string
}

function calcularDiferenciaHoras(inicio: string, fin: string) {
  const [hInicio, mInicio] = inicio.split(':').map(Number);
  const [hFin, mFin] = fin.split(':').map(Number);

  const minutosInicio = hInicio * 60 + mInicio;
  const minutosFin = hFin * 60 + mFin;

  let totalMinutos = minutosFin - minutosInicio;

  if (totalMinutos < 0) {
    totalMinutos += 24 * 60; // Maneja el caso donde el fin es al día siguiente
  }

  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;

  return `${horas} hora${horas !== 1 ? 's' : ''} ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
}

function Content() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const [entry, setEntry] = useState<WorkEntry>({
    _id: "",
    supervisorName: "",
    name: "",
    comments: "",
    date: "",
    startTime: "",
    endTime: ""
  })
  const navigate = useRouter().push
  const [reason, setReason] = useState("")
  const [editing, setEditing] = useState(false)
  const startRef = useRef<HTMLInputElement | null>(null)
  const endRef = useRef<HTMLInputElement | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    const token = localStorage.getItem("token");
    makeQuery(
      token,
      "getWorkEntry",
      id || '',
      enqueueSnackbar,
      (data: WorkEntry) => {
        setEntry(data)
      }
    );
  }, [id]);

  const handleSubmit = async () => {
    makeQuery(
      localStorage.getItem("token"),
      "createExtraHourRequest",
      {
        entry: id,
        reason,
        startTime: entry.startTime,
        endTime: entry.endTime
      },
      enqueueSnackbar,
      () => {
        enqueueSnackbar("Solicitud enviada", { variant: "success" })
        setEditing(false)
        navigate("/home/request-hours")
      },
    )
  }

  return (
      <UserPage>
        <div className="p-4 pb-24">
          {/* Header with Back Button */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/home/request-hours" className="text-gray-600">
              <FaArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-medium text-gray-800">Agregar horas</h1>
          </div>

          {/* Project Info Card */}
          <div className="bg-[#EDEDED] rounded-2xl p-4 shadow-sm mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-[#55C157]" />
              <span className="text-gray-600 ml-4">
                {
                  entry._id.slice(0, 6)
                }
              </span>
              <div className="flex-1" />
              <span className="text-gray-600 text-sm">Responsable</span>
              <span className="bg-[#6A8D73] text-white text-xs px-2 py-2 rounded-full">
                {entry.supervisorName.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <h1 className="font-bold text-gray-800">
              {entry.name}
            </h1>
            <p className="text-gray-600">
              {entry.comments}
            </p>
          </div>

          {/* Date */}
          <div className="text-center mb-6">
            <h3 className="text-gray-800 font-semibold">
              {new Date(entry.date).toLocaleDateString("es-MX", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>
          </div>

          {/* Total Hours */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de Horas</span>
              <span className="text-green font-medium">
                {calcularDiferenciaHoras(entry.startTime, entry.endTime)}
              </span>
            </div>
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-2 flex flex-col items-center">
              <label className="text-sm text-gray-600">Inicio</label>
              <div className="relative">
                <input type="time" value={
                  entry.startTime
                } className="w-full bg-gray-100 rounded-lg p-3 pr-10" readOnly={
                  !editing
                }
                  ref={startRef}
                  onChange={(e) => {
                    setEntry((prev) => ({ ...prev, startTime: e.target.value }))
                  }}
                />
                <FaClock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2 flex flex-col items-center">
              <label className="text-sm text-gray-600">Final</label>
              <div className="relative">
                <input type="time" value={
                  entry.endTime
                } className="w-full bg-gray-100 rounded-lg p-3 pr-10" readOnly={
                  !editing
                }
                  ref={endRef}
                  onChange={(e) => {
                    setEntry((prev) => ({ ...prev, endTime: e.target.value }))
                  }}
                />
                <FaClock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Text Area for Comments */}
          {editing && <div className="mb-6">
            <label className="text-sm text-gray-600">Razón</label>
            <textarea value={reason} className="w-full bg-gray-100 rounded-lg p-3 h-24 resize-none" readOnly={!editing}
              onChange={(e) => {
                setReason(e.target.value)
              }}
            />
          </div>}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!editing && <button className="w-full flex items-center justify-center gap-2 bg-[#525252] hover:bg-gray-800 text-white rounded-lg py-3 px-4 transition-colors" onClick={() => {
              setEditing(true)
              startRef.current?.focus()
            }}>
              <FaPencilAlt className="w-4 h-4" />
              Agregar Horas
            </button>}

            {editing && <button className="w-full bg-green font-bold hover:bg-[#5a7a62] text-white text-xl rounded-lg py-3 px-4 transition-colors" onClick={handleSubmit}>
              Enviar
            </button>}
          </div>
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