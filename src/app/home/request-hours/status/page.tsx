'use client'
import UserPage from "@/app/home/components/UserPage"
import { makeQuery } from "@/app/utils/api"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useSnackbar } from "notistack"
import { Suspense, useEffect, useState } from "react"
import { FaArrowLeft } from "react-icons/fa"

type Status = "approved" | "rejected" | "pending" | ""

interface WorkEntry {
  name: string
  date: string
  _id: string
  startTime: string
  endTime: string
  comments: string
  supervisorName: string
  overtime?: string
}

interface User {
  _id: string
  name: string
}

interface Request {
  _id: string
  user: User
  entry: WorkEntry
  reason: string
  startTime: string
  endTime: string
  createdAt: Date
  status: Status
}

const getStatusBadge = (status: Status) => {
  switch (status) {
    case "approved":
      return <span className="text-[#55C157] bg-[#E8F5E6] border-2 border-[#55C157] px-5 py-2 rounded-2xl text-sm">Aprobado</span>
    case "rejected":
      return <span className="text-[#FF4220] bg-red-100 px-5 py-2 border-2 border-[#FF4220] rounded-2xl text-sm">No aprobado</span>
    case "pending":
      return <span className="text-[#16A4F8] bg-blue-100 px-5 py-2 border-2 border-[#16A4F8] rounded-2xl text-sm">En proceso</span>
  }
}

function Content() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const [request, setRequest] = useState<Request>({
    _id: "",
    user: { _id: "", name: "" },
    entry: {
      name: "",
      date: "",
      _id: "",
      startTime: "",
      endTime: "",
      comments: "",
      supervisorName: "",
    },
    reason: "",
    startTime: "",
    endTime: "",
    createdAt: new Date(),
    status: "",
  })
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    const token = localStorage.getItem("token");
    makeQuery(
      token,
      "getExtraHourRequest",
      id || '',
      enqueueSnackbar,
      (data: Request) => {
        setRequest(data)
      }
    );
  }, []);

  return (
    <UserPage>
      <div className="p-4 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/home/request-hours" className="text-gray-600">
            <FaArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-medium text-gray-800">Estado</h1>
        </div>

        {/* Project Status Cards */}
        <div className="space-y-4">
          <div className="bg-[#EDEDED] rounded-lg p-5 shadow-sm flex flex-col ">
            <div className="flex items-center justify-between mb-4">
              {getStatusBadge(request.status)}
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Responsable</span>
                <span className="bg-[#6A8D73] text-white text-xs px-2 py-2 rounded-full">
                  {request.entry.supervisorName.slice(0, 2).toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-[#55C157]" />
              <span className="text-gray-600 ml-4">{
                request._id.slice(0, 6)
              }</span>
            </div>

            <div className="mb-3">
              <h2 className="font-bold text-gray-800">{
                request.entry.name
              }</h2>
              <p className="text-gray-600">{
                request.reason
              }</p>
            </div>

            {request.status !== "pending" && <Link href={`
              /home/request-hours/status/request?id=${request._id}  
              `} className="w-full text-base font-bold text-center py-2 bg-white text-[#6A8D73] hover:text-[#5a7a62] transition-colors rounded-xl">
              Ver detalles
            </Link>}
          </div>
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