"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FaSignOutAlt, FaInfoCircle, FaCalendarAlt } from "react-icons/fa"
import { makeQuery } from "@/app/utils/api"
import { useSnackbar } from "notistack"
import env from "@/app/env"
import axios from "axios"

interface User {
  _id: string
  name: string
  role: "colaborador" | "topografo"
  regularHours: number
  extraHours: number
  totalPay: string
  details: Detail[]
}

interface Detail {
  projectName: string
  regularHours: number
  extraHours: number
  pay: string
}

export default function MonthlyPayrollPage() {
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [users, setUsers] = useState<User[]>([])
  const { enqueueSnackbar } = useSnackbar()


  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const openModal = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const downloadPdf = async () => {
    const response = await axios.post(
      `${env.API_URL}/user/payroll-summary-downloadpdf`,
      { year: selectedYear, month: selectedMonth },
      {
        responseType: 'blob',
      }
    );

    // Crear link de descarga
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'Sumario.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    makeQuery(
      token,
      "payrollSummary",
      {
        month: selectedMonth,
        year: selectedYear,
      },
      enqueueSnackbar,
      (data) => setUsers(data),
    );
  }, [selectedMonth, selectedYear]);

  return (
    <main className="bg-violet-100 w-full min-h-screen">
      <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Nómina Mensual</h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center bg-violet-700 hover:bg-violet-800 px-4 py-2 rounded-md transition duration-300"
        >
          <FaSignOutAlt className="mr-2" />
          Dashboard
        </button>
      </header>

      <section className="p-4">
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaCalendarAlt className="mr-2 text-violet-600" />
            Seleccionar Período
          </h2>
          <div className="flex justify-between">
            <div className="flex flex-wrap gap-4">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Año
                </label>
                <select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full md:w-32 p-2 border rounded"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1" translate="no">
                  Mes
                </label>
                <select
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full md:w-40 p-2 border rounded"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index} translate="no">
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={downloadPdf}
              className="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Descargar Resumen
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4" translate="no">
            Resumen de Nómina - {months[selectedMonth]} {selectedYear}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Horas Regulares
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Horas Extra
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Pago Total
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Detalles
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  return (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.regularHours}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.extraHours}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.totalPay}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => openModal(user)} className="text-blue-600 hover:text-blue-900">
                          <FaInfoCircle />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">
              Detalle de {selectedUser.name} - {months[selectedMonth]} {selectedYear}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Proyecto
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Horas Regulares
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Horas Extra
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pago
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedUser.details.map((detail: Detail) => (
                    <tr key={detail.projectName}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {detail.projectName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{detail.regularHours}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{detail.extraHours}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{detail.pay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

