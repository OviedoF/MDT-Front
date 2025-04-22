'use client'
import UserPage from "@/app/home/components/UserPage"
import { FaTimesCircle, FaQuestionCircle, FaCheckCircle } from "react-icons/fa"
import { makeQuery } from "@/app/utils/api"
import { useRouter, useSearchParams } from "next/navigation"
import { useSnackbar } from "notistack"
import { Suspense, useEffect, useState } from "react"

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
  message?: string
}

function Content() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const navigate = useRouter()
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
      id || "",
      enqueueSnackbar,
      (data: Request) => {
        setRequest(data)
      }
    );
  }, []);

  return (
    <UserPage>
      <div className="p-4 flex flex-col pb-24">
        <div className="flex-1 px-4 py-8 max-w-md mx-auto w-full">
          {request.status === "rejected" && <div className="text-center mb-8">
            <div className="inline-block text-red-500 mb-2">
              <FaTimesCircle className="w-16 h-16" />
            </div>
            <h1 className="text-red-500 text-2xl font-medium">Solicitud denegada</h1>
          </div>}

          {request.status === "approved" && <div className="text-center mb-8">
            <div className="inline-block text-[#55C157] mb-2">
              <FaCheckCircle className="w-16 h-16" />
            </div>
            <h1 className="text-[#55C157] text-2xl font-medium">Solicitud aprobada</h1>
          </div>}

          <div className="flex items-center gap-3 mb-6 px-10">
            <div className="w-10 h-10 bg-green rounded-full flex items-center justify-center text-white font-medium">
              {request.user.name.slice(0, 2).toUpperCase()}
            </div>

            <div>
              <div className="font-normal">
                {request.user.name}
              </div>
            </div>
          </div>

          {/* Denial Explanation */}
          <div className="space-y-4 mb-8">
            <p className="text-gray-600">
              {request.message}
            </p>
          </div>

          {/* Accept Button */}
          <button className="w-full bg-green hover:bg-[#5a7a62] font-bold text-white rounded-lg py-3 px-4 transition-colors mb-6" onClick={() => navigate.back()}>
            Aceptar
          </button>

          {request.status === "rejected" &&
            <div className="flex items-start gap-2 text-sm text-gray-600 px-4">
              <FaQuestionCircle className="w-5 h-5 text-[#6A8D73] mt-0.5" />
              <div>
                <p className="font-medium">¿Dudas sobre la solicitud denegada?</p>
                <p>Comunícate con el área al 0000-0000.</p>
              </div>
            </div>}
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